import "dotenv/config";
import express from "express";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mapsns.db");
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    bio TEXT,
    profilePic TEXT
  );

  -- Add columns if they don't exist (for existing databases)
  PRAGMA table_info(users);
`);

// Add columns manually if they don't exist
try {
  db.prepare("ALTER TABLE posts ADD COLUMN category TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE users ADD COLUMN bio TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE users ADD COLUMN profilePic TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE pins ADD COLUMN description TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE pins ADD COLUMN category TEXT").run();
} catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    imageUrl TEXT,
    category TEXT,
    lat REAL,
    lng REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    description TEXT,
    category TEXT,
    lat REAL,
    lng REAL,
    postId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    points TEXT,
    path TEXT,
    distance INTEGER,
    duration INTEGER,
    transportMode TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follows (
    followerId INTEGER,
    followingId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (followerId, followingId),
    FOREIGN KEY(followerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(followingId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    userId INTEGER,
    postId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, postId),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    type TEXT,
    fromUserId INTEGER,
    postId INTEGER,
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(fromUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
  );
`);

// Migration to ensure ON DELETE CASCADE is present
const migrateTable = (tableName: string, createSql: string, expectedFkCount: number) => {
  try {
    const fkList = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
    // Check if foreign keys are missing or missing the CASCADE action
    const needsMigration = fkList.length < expectedFkCount || fkList.some((fk: any) => {
      const onDelete = String(fk.on_delete || '').toUpperCase().trim();
      return onDelete !== 'CASCADE';
    });
    
    if (needsMigration) {
      console.log(`Migrating ${tableName} table to ensure correct foreign keys and ON DELETE CASCADE...`);
      
      // PRAGMA foreign_keys = OFF must be outside of a transaction
      db.pragma('foreign_keys = OFF');
      
      try {
        db.transaction(() => {
          // Check if table exists
          const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
          
          if (tableExists) {
            db.exec(`ALTER TABLE ${tableName} RENAME TO ${tableName}_old`);
            db.exec(createSql);
            
            // Get columns of the new table to avoid issues with missing columns in old table
            const columns = db.prepare(`PRAGMA table_info(${tableName})`).all().map((c: any) => c.name);
            const oldColumns = db.prepare(`PRAGMA table_info(${tableName}_old)`).all().map((c: any) => c.name);
            const commonColumns = columns.filter(c => oldColumns.includes(c));
            
            const colList = commonColumns.join(', ');
            db.exec(`INSERT INTO ${tableName} (${colList}) SELECT ${colList} FROM ${tableName}_old`);
            db.exec(`DROP TABLE ${tableName}_old`);
          } else {
            db.exec(createSql);
          }
        })();
        console.log(`Successfully migrated ${tableName}`);
      } finally {
        db.pragma('foreign_keys = ON');
      }
    }
  } catch (e) {
    console.error(`Migration failed for ${tableName}`, e);
    db.pragma('foreign_keys = ON');
  }
};

// Debug: Check current FK status
const checkFks = (tableName: string) => {
  const fks = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
  console.log(`Foreign keys for ${tableName}:`, JSON.stringify(fks, null, 2));
};

migrateTable('posts', `
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    imageUrl TEXT,
    category TEXT,
    lat REAL,
    lng REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )
`, 1);
checkFks('posts');

migrateTable('pins', `
  CREATE TABLE pins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    description TEXT,
    category TEXT,
    lat REAL,
    lng REAL,
    postId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
  )
`, 2);
checkFks('pins');

migrateTable('routes', `
  CREATE TABLE routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    points TEXT,
    path TEXT,
    distance INTEGER,
    duration INTEGER,
    transportMode TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )
`, 1);
checkFks('routes');

migrateTable('follows', `
  CREATE TABLE follows (
    followerId INTEGER,
    followingId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (followerId, followingId),
    FOREIGN KEY(followerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(followingId) REFERENCES users(id) ON DELETE CASCADE
  )
`, 2);
checkFks('follows');

// Final check to ensure foreign keys are ON
db.pragma('foreign_keys = ON');
console.log("Foreign keys enabled:", db.pragma('foreign_keys', { simple: true }));

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
      const result = stmt.run(email, hashedPassword, name);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn(`Login failed for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log(`Login successful for: ${email}`);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, profilePic: user.profilePic } });
  });

  // Profile Routes
  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const user: any = db.prepare(`
      SELECT 
        u.id, u.email, u.name, u.bio, u.profilePic,
        (SELECT COUNT(*) FROM follows WHERE followingId = u.id) as followersCount,
        (SELECT COUNT(*) FROM follows WHERE followerId = u.id) as followingCount
      FROM users u 
      WHERE u.id = ?
    `).get(req.user.id);
    res.json(user);
  });

  app.get("/api/users/:id", (req, res) => {
    const user: any = db.prepare(`
      SELECT 
        u.id, u.name, u.bio, u.profilePic,
        (SELECT COUNT(*) FROM follows WHERE followingId = u.id) as followersCount,
        (SELECT COUNT(*) FROM follows WHERE followerId = u.id) as followingCount
      FROM users u 
      WHERE u.id = ?
    `).get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.get("/api/users/:id/follow-status", authenticateToken, (req: any, res) => {
    const follow = db.prepare("SELECT * FROM follows WHERE followerId = ? AND followingId = ?").get(req.user.id, req.params.id);
    res.json({ isFollowing: !!follow });
  });

  app.post("/api/users/:id/follow", authenticateToken, (req: any, res) => {
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    try {
      db.pragma('foreign_keys = ON');
      db.prepare("INSERT INTO follows (followerId, followingId) VALUES (?, ?)").run(req.user.id, req.params.id);
      
      // Create notification
      db.prepare("INSERT INTO notifications (userId, type, fromUserId) VALUES (?, 'follow', ?)").run(req.params.id, req.user.id);
      
      res.sendStatus(201);
    } catch (e) {
      res.status(400).json({ error: "Already following or user not found" });
    }
  });

  app.delete("/api/users/:id/follow", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM follows WHERE followerId = ? AND followingId = ?").run(req.user.id, req.params.id);
    res.sendStatus(204);
  });

  app.put("/api/profile", authenticateToken, (req: any, res) => {
    const { name, bio, profilePic } = req.body;
    db.prepare("UPDATE users SET name = ?, bio = ?, profilePic = ? WHERE id = ?").run(name, bio, profilePic, req.user.id);
    const user: any = db.prepare("SELECT id, email, name, bio, profilePic FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  // Post Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare(`
      SELECT 
        posts.*, 
        users.name as userName,
        (SELECT COUNT(*) FROM likes WHERE postId = posts.id) as likesCount
      FROM posts 
      JOIN users ON posts.userId = users.id 
      ORDER BY createdAt DESC
    `).all();
    res.json(posts);
  });

  app.post("/api/posts", authenticateToken, (req: any, res) => {
    const { content, imageUrl, category, lat, lng } = req.body;
    try {
      db.pragma('foreign_keys = ON');
      
      const userId = Number(req.user.id);
      const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      const stmt = db.prepare("INSERT INTO posts (userId, content, imageUrl, category, lat, lng) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(userId, content, imageUrl, category || 'default', lat, lng);
      const postId = result.lastInsertRowid;

      // Handle Mentions
      const mentions = content.match(/@(\w+)/g);
      if (mentions) {
        const uniqueMentions = Array.from(new Set(mentions.map((m: string) => m.substring(1))));
        for (const name of uniqueMentions) {
          const user: any = db.prepare("SELECT id FROM users WHERE name = ?").get(name);
          if (user && user.id !== req.user.id) {
            db.prepare("INSERT INTO notifications (userId, type, fromUserId, postId) VALUES (?, 'mention', ?, ?)").run(user.id, req.user.id, postId);
          }
        }
      }

      res.status(201).json({ id: postId });
    } catch (e: any) {
      console.error("Create post error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Pin Routes
  app.get("/api/pins", (req, res) => {
    const pins = db.prepare(`
      SELECT pins.*, users.name as userName 
      FROM pins 
      JOIN users ON pins.userId = users.id
    `).all();
    res.json(pins);
  });

  app.post("/api/pins", authenticateToken, (req: any, res) => {
    const { title, description, category, lat, lng, postId } = req.body;
    try {
      db.pragma('foreign_keys = ON');
      
      const userId = Number(req.user.id);
      const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      let finalPostId = null;
      if (postId !== undefined && postId !== null && postId !== "") {
        const parsedPostId = Number(postId);
        if (!isNaN(parsedPostId)) {
          const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(parsedPostId);
          if (post) {
            finalPostId = post.id;
          }
        }
      }

      const stmt = db.prepare("INSERT INTO pins (userId, title, description, category, lat, lng, postId) VALUES (?, ?, ?, ?, ?, ?, ?)");
      const result = stmt.run(userId, title, description || null, category || 'default', lat, lng, finalPostId);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e: any) {
      console.error("Create pin error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, (req: any, res) => {
    try {
      db.pragma('foreign_keys = ON');
      const fkStatus = db.pragma('foreign_keys', { simple: true });
      console.log(`Deleting post ${req.params.id}, FK status: ${fkStatus}`);
      const stmt = db.prepare("DELETE FROM posts WHERE id = ? AND userId = ?");
      const result = stmt.run(req.params.id, req.user.id);
      if (result.changes === 0) return res.sendStatus(404);
      res.sendStatus(204);
    } catch (e: any) {
      console.error("Delete post error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/posts/:id", authenticateToken, (req: any, res) => {
    const { content, imageUrl, category } = req.body;
    const stmt = db.prepare("UPDATE posts SET content = ?, imageUrl = ?, category = ? WHERE id = ? AND userId = ?");
    const result = stmt.run(content, imageUrl, category || 'default', req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ id: req.params.id, content, imageUrl, category });
  });

  app.post("/api/posts/:id/like", authenticateToken, (req: any, res) => {
    try {
      db.pragma('foreign_keys = ON');
      db.prepare("INSERT INTO likes (userId, postId) VALUES (?, ?)").run(req.user.id, req.params.id);
      
      const post: any = db.prepare("SELECT userId FROM posts WHERE id = ?").get(req.params.id);
      if (post && post.userId !== req.user.id) {
        db.prepare("INSERT INTO notifications (userId, type, fromUserId, postId) VALUES (?, 'like', ?, ?)").run(post.userId, req.user.id, req.params.id);
      }
      
      res.sendStatus(201);
    } catch (e) {
      res.status(400).json({ error: "Already liked or post not found" });
    }
  });

  app.delete("/api/posts/:id/like", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM likes WHERE userId = ? AND postId = ?").run(req.user.id, req.params.id);
    res.sendStatus(204);
  });

  app.delete("/api/pins/:id", authenticateToken, (req: any, res) => {
    try {
      db.pragma('foreign_keys = ON');
      const fkStatus = db.pragma('foreign_keys', { simple: true });
      console.log(`Deleting pin ${req.params.id}, FK status: ${fkStatus}`);
      const stmt = db.prepare("DELETE FROM pins WHERE id = ? AND userId = ?");
      const result = stmt.run(req.params.id, req.user.id);
      if (result.changes === 0) return res.sendStatus(404);
      res.sendStatus(204);
    } catch (e: any) {
      console.error("Delete pin error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Saved Route Routes
  app.get("/api/saved-routes", authenticateToken, (req: any, res) => {
    const routes = db.prepare("SELECT * FROM routes WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
    res.json(routes);
  });

  app.post("/api/saved-routes", authenticateToken, (req: any, res) => {
    const { name, points, path, distance, duration, transportMode } = req.body;
    try {
      db.pragma('foreign_keys = ON');
      
      const userId = Number(req.user.id);
      const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      const stmt = db.prepare("INSERT INTO routes (userId, name, points, path, distance, duration, transportMode) VALUES (?, ?, ?, ?, ?, ?, ?)");
      const result = stmt.run(userId, name, JSON.stringify(points), JSON.stringify(path), distance, duration, transportMode);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e: any) {
      console.error("Save route error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/saved-routes/:id", authenticateToken, (req: any, res) => {
    try {
      db.pragma('foreign_keys = ON');
      const stmt = db.prepare("DELETE FROM routes WHERE id = ? AND userId = ?");
      stmt.run(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (e: any) {
      console.error("Delete route error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Route Proxy
  app.get("/api/route", async (req, res) => {
    const { origin, destination, waypoints, mode } = req.query;
    const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY;
    
    if (!KAKAO_REST_KEY) {
      return res.status(401).json({ 
        error: "REST API Key missing", 
        detail: { msg: "Please set KAKAO_REST_KEY in environment variables.", code: -401 } 
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Missing parameters",
        detail: { msg: "Origin and destination are required.", code: -400 }
      });
    }
    
    try {
      const { origin, destination, waypoints, mode, priority: reqPriority } = req.query;
      
      const params: any = {
        origin: String(origin),
        destination: String(destination),
        priority: reqPriority || (mode === 'car' ? "RECOMMEND" : "DISTANCE")
      };

      // For bike and walk, we avoid highways to get a more realistic road path
      // Note: Kakao Directions API v1 is primarily for cars, so this is a best-effort road path.
      if (mode === 'bike' || mode === 'walk') {
        params.avoid = 'highway';
      }

      if (waypoints && String(waypoints).trim() !== "") {
        params.waypoints = String(waypoints);
      }

      const response = await axios.get("https://apis-navi.kakaomobility.com/v1/directions", {
        params,
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_KEY}`
        }
      });
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      // Log full error for debugging
      console.error("Kakao Route API Error:", {
        status: error.response?.status,
        data: errorData,
        message: error.message,
        params: req.query
      });
      
      res.status(error.response?.status || 500).json({ 
        error: "Failed to fetch route", 
        detail: errorData || { msg: error.message }
      });
    }
  });

  app.get("/api/profile/following-ids", authenticateToken, (req: any, res) => {
    const following = db.prepare("SELECT followingId FROM follows WHERE followerId = ?").all(req.user.id);
    res.json(following.map((f: any) => f.followingId));
  });

  app.get("/api/profile/liked-post-ids", authenticateToken, (req: any, res) => {
    const liked = db.prepare("SELECT postId FROM likes WHERE userId = ?").all(req.user.id);
    res.json(liked.map((l: any) => l.postId));
  });

  app.get("/api/users/:id/followers", (req, res) => {
    const followers = db.prepare(`
      SELECT u.id, u.name, u.bio, u.profilePic 
      FROM users u
      JOIN follows f ON u.id = f.followerId
      WHERE f.followingId = ?
    `).all(req.params.id);
    res.json(followers);
  });

  app.get("/api/users/:id/following", (req, res) => {
    const following = db.prepare(`
      SELECT u.id, u.name, u.bio, u.profilePic 
      FROM users u
      JOIN follows f ON u.id = f.followingId
      WHERE f.followerId = ?
    `).all(req.params.id);
    res.json(following);
  });

  // Notification Routes
  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const notifications = db.prepare(`
      SELECT n.*, u.name as fromUserName, u.profilePic as fromUserProfilePic
      FROM notifications n
      JOIN users u ON n.fromUserId = u.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
    `).all(req.user.id);
    res.json(notifications.map((n: any) => ({ ...n, isRead: !!n.isRead })));
  });

  app.post("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
    res.sendStatus(200);
  });

  app.post("/api/notifications/read-all", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?").run(req.user.id);
    res.sendStatus(200);
  });

  app.get("/api/users/search", (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = db.prepare(`
      SELECT id, name, bio, profilePic 
      FROM users 
      WHERE name LIKE ? OR bio LIKE ?
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`);
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
