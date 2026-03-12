# Backend Migration Task — refactoring 프론트엔드 연동을 위한 Spring Boot 백엔드 확장

> **목적**: `web/` 프론트엔드(refactoring 기반)가 요구하는 모든 API를 Spring Boot 백엔드에서 제공
> **작성일**: 2026-03-12
> **기반 문서**: `refactoring/docs/MIGRATION_DIFF_REPORT.md`

---

## 현황 요약

### 프론트엔드가 호출하는 API vs 백엔드 구현 상태

| 엔드포인트 | 메서드 | 프론트엔드 사용처 | 백엔드 상태 |
|-----------|--------|-----------------|------------|
| `/api/auth/login` | POST | 로그인 | **구현됨** |
| `/api/auth/me` | GET | 사용자 정보 조회 | **구현됨** |
| `/api/auth/refresh` | POST | 토큰 갱신 | **구현됨** |
| `/api/members` | POST | 회원가입 | **구현됨** |
| `/api/posts` | GET/POST | 게시글 목록/생성 | **구현됨** (필드 매핑 필요) |
| `/api/posts/{id}` | PUT | 게시글 수정 | **구현됨** (필드 매핑 필요) |
| `/api/pins` | GET/POST | 핀 목록/생성 | **구현됨** (필드 매핑 필요) |
| `/api/me` | PUT | 프로필 수정 | **구현됨** (필드 확장 필요) |
| `/api/map/directions` | GET | 경로 조회 | **구현됨** |
| `/api/posts/{id}/like` | POST/DELETE | 좋아요/취소 | **미구현** |
| `/api/profile/liked-post-ids` | GET | 좋아요한 게시글 ID 목록 | **미구현** |
| `/api/users/{id}/follow` | POST/DELETE | 팔로우/언팔로우 | **미구현** |
| `/api/profile/following-ids` | GET | 팔로잉 ID 목록 | **미구현** |
| `/api/users/{id}` | GET | 사용자 프로필 조회 | **미구현** |
| `/api/users/search` | GET | 사용자 검색 | **미구현** |
| `/api/notifications` | GET | 알림 목록 | **미구현** |
| `/api/notifications/{id}/read` | POST | 알림 읽음 처리 | **미구현** |
| `/api/notifications/read-all` | POST | 전체 알림 읽음 | **미구현** |
| `/api/saved-routes` | GET/POST | 경로 저장/목록 | **미구현** |
| `/api/saved-routes/{id}` | DELETE | 경로 삭제 | **미구현** |
| `/api/route` | GET | Kakao 경로 프록시 | **미구현** (기존 `/api/map/directions`와 파라미터 형식 다름) |

### 필드 매핑 불일치 (기존 엔드포인트)

**Post 응답 필드**:
| 프론트엔드 기대 | 백엔드 현재 | 조치 |
|----------------|-----------|------|
| `userId` | `authorId` | 별칭 추가 또는 프론트 수정 |
| `userName` | `authorNickname` | 별칭 추가 또는 프론트 수정 |
| `lat` | `latitude` | 별칭 추가 또는 프론트 수정 |
| `lng` | `longitude` | 별칭 추가 또는 프론트 수정 |
| `imageUrl` | 없음 | Post 엔티티에 필드 추가 |
| `category` | 없음 | Post 엔티티에 필드 추가 |
| `likesCount` | 없음 | Like 기능 구현 후 추가 |
| `isLiked` | 없음 | Like 기능 구현 후 추가 |

**Pin 응답 필드**:
| 프론트엔드 기대 | 백엔드 현재 | 조치 |
|----------------|-----------|------|
| `userId` | `ownerId` | 별칭 추가 또는 프론트 수정 |
| `userName` | `ownerNickname` | 별칭 추가 또는 프론트 수정 |
| `lat` | `latitude` | 별칭 추가 또는 프론트 수정 |
| `lng` | `longitude` | 별칭 추가 또는 프론트 수정 |
| `title` | 없음 | Pin 엔티티에 필드 추가 |
| `category` | 없음 | Pin 엔티티에 필드 추가 |

**User 응답 필드**:
| 프론트엔드 기대 | 백엔드 현재 | 조치 |
|----------------|-----------|------|
| `name` | `nickname` | 별칭 추가 또는 프론트 수정 |
| `bio` | 없음 | User 엔티티에 필드 추가 |
| `profilePic` | 없음 | User 엔티티에 필드 추가 |
| `followersCount` | 없음 | Follow 기능 구현 후 추가 |
| `followingCount` | 없음 | Follow 기능 구현 후 추가 |

---

## Step 구성

```
Step 1: 엔티티 확장 (Post, Pin, User 필드 추가)
Step 2: 응답 DTO 필드 매핑 정렬
Step 3: Like(좋아요) 도메인 구현
Step 4: Follow(팔로우) 도메인 구현
Step 5: Notification(알림) 도메인 구현
Step 6: SavedRoute(경로 저장) 도메인 구현
Step 7: 사용자 검색 · 공개 프로필 API
Step 8: Kakao 경로 프록시 호환 API
Step 9: 프론트엔드 필드 매핑 동기화
Step 10: 통합 테스트 · 빌드 검증
```

---

## Step 1: 엔티티 확장

> **목표**: 프론트엔드가 요구하는 필드를 기존 엔티티에 추가

### 1.1 User 엔티티 확장

**파일**: `src/main/java/com/example/sns/domain/User.java`

```java
// 추가할 필드
@Column(length = 500)
private String bio;

@Column(length = 500)
private String profilePic;  // URL or storage path
```

**마이그레이션**: `ALTER TABLE users ADD COLUMN bio VARCHAR(500)`, `ALTER TABLE users ADD COLUMN profile_pic VARCHAR(500)`

### 1.2 Post 엔티티 확장

**파일**: `src/main/java/com/example/sns/domain/Post.java`

```java
// 추가할 필드
@Column(length = 500)
private String imageUrl;

@Column(length = 50)
private String category;  // default, cafe, food, photo, favorite, must-visit
```

**마이그레이션**: `ALTER TABLE posts ADD COLUMN image_url VARCHAR(500)`, `ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT 'default'`

### 1.3 Pin 엔티티 확장

**파일**: `src/main/java/com/example/sns/domain/Pin.java`

```java
// 추가할 필드
@Column(length = 200)
private String title;

@Column(length = 50)
private String category;  // default, cafe, food, photo, favorite, must-visit
```

**마이그레이션**: `ALTER TABLE pins ADD COLUMN title VARCHAR(200)`, `ALTER TABLE pins ADD COLUMN category VARCHAR(50) DEFAULT 'default'`

### 산출물
- [ ] `User.java` — bio, profilePic 필드 추가
- [ ] `Post.java` — imageUrl, category 필드 추가
- [ ] `Pin.java` — title, category 필드 추가
- [ ] Request/Response DTO에 새 필드 반영
- [ ] H2 dev 환경 자동 DDL 확인 (spring.jpa.hibernate.ddl-auto=update)

---

## Step 2: 응답 DTO 필드 매핑 정렬

> **목표**: 프론트엔드 타입(`types.ts`)과 백엔드 응답 DTO 필드명 통일

### 방향 결정: **백엔드 DTO에 `@JsonProperty` 별칭 추가**

프론트엔드 코드(useMapSNS.ts ~1800줄) 전체를 수정하는 것보다 백엔드에서 별칭을 추가하는 것이 안전합니다.

### 2.1 PostResponse 수정

**파일**: `src/main/java/com/example/sns/dto/response/PostResponse.java`

```java
// 기존 필드 유지 + 프론트엔드 호환 별칭 추가
@JsonProperty("userId")
public Long getAuthorId() { return authorId; }

@JsonProperty("userName")
public String getAuthorNickname() { return authorNickname; }

@JsonProperty("lat")
public Double getLatitude() { return latitude; }

@JsonProperty("lng")
public Double getLongitude() { return longitude; }

// 새 필드
private String imageUrl;
private String category;
private Integer likesCount;  // Step 3에서 구현
private Boolean isLiked;     // Step 3에서 구현
```

### 2.2 PinResponse 수정

**파일**: `src/main/java/com/example/sns/dto/response/PinResponse.java`

```java
@JsonProperty("userId")
public Long getOwnerId() { return ownerId; }

@JsonProperty("userName")
public String getOwnerNickname() { return ownerNickname; }

@JsonProperty("lat")
public Double getLatitude() { return latitude; }

@JsonProperty("lng")
public Double getLongitude() { return longitude; }

// 새 필드
private String title;
private String category;
```

### 2.3 MemberResponse / UserProfileResponse

프론트엔드가 기대하는 User 형식:
```java
public record UserProfileResponse(
    Long id,
    String email,
    String name,       // nickname을 name으로
    String nickname,   // 원래 값도 유지
    String bio,
    String profilePic,
    String role,
    Integer followersCount,  // Step 4에서 구현
    Integer followingCount   // Step 4에서 구현
) {}
```

### 산출물
- [ ] `PostResponse.java` — 별칭 + 새 필드
- [ ] `PinResponse.java` — 별칭 + 새 필드
- [ ] `UserProfileResponse.java` — 신규 DTO 생성
- [ ] `PostCreateRequest.java` — imageUrl, category, lat/lng 별칭 추가
- [ ] `PinCreateRequest.java` — title, category, lat/lng 별칭 추가
- [ ] 기존 테스트 수정 (필드명 변경에 따른)

---

## Step 3: Like(좋아요) 도메인 구현

> **목표**: 게시글 좋아요/취소, 좋아요 수 조회, 내가 좋아요한 게시글 ID 목록

### 3.1 엔티티

**파일**: `src/main/java/com/example/sns/domain/PostLike.java` (신규)

```java
@Entity
@Table(name = "post_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "post_id"})
})
public class PostLike extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}
```

### 3.2 Repository

**파일**: `src/main/java/com/example/sns/repository/PostLikeRepository.java` (신규)

```java
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Optional<PostLike> findByUserAndPost(User user, Post post);
    int countByPost(Post post);
    @Query("SELECT pl.post.id FROM PostLike pl WHERE pl.user.id = :userId")
    List<Long> findPostIdsByUserId(@Param("userId") Long userId);
}
```

### 3.3 Service

**파일**: `src/main/java/com/example/sns/service/PostLikeService.java` (신규)

```
- like(userId, postId): 중복 체크 후 생성, Notification 발행 (Step 5)
- unlike(userId, postId): 삭제
- countByPost(postId): 좋아요 수
- isLikedByUser(userId, postId): 좋아요 여부
- getLikedPostIds(userId): 좋아요한 게시글 ID 목록
```

### 3.4 Controller

**파일**: `src/main/java/com/example/sns/controller/api/PostLikeController.java` (신규)

```
POST   /api/posts/{id}/like     → like()
DELETE /api/posts/{id}/like     → unlike()
GET    /api/profile/liked-post-ids → getLikedPostIds() (인증 필수)
```

### 3.5 PostResponse 확장

PostService에서 게시글 조회 시 likesCount, isLiked를 함께 계산하여 반환.

### 산출물
- [ ] `PostLike.java` 엔티티
- [ ] `PostLikeRepository.java`
- [ ] `PostLikeService.java`
- [ ] `PostLikeController.java`
- [ ] `PostResponse` likesCount, isLiked 필드 채우기
- [ ] `SecurityConfig` 엔드포인트 권한 설정
- [ ] 단위 테스트

---

## Step 4: Follow(팔로우) 도메인 구현

> **목표**: 사용자 간 팔로우/언팔로우, 팔로워·팔로잉 목록, 카운트

### 4.1 엔티티

**파일**: `src/main/java/com/example/sns/domain/Follow.java` (신규)

```java
@Entity
@Table(name = "follows", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
public class Follow extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;    // 팔로우를 하는 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;   // 팔로우를 당하는 사람
}
```

### 4.2 Repository

```java
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    int countByFollowing(User following);  // 팔로워 수
    int countByFollower(User follower);    // 팔로잉 수
    @Query("SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId")
    List<Long> findFollowingIdsByFollowerId(@Param("userId") Long userId);
    List<Follow> findByFollowing(User following);  // 팔로워 목록
    List<Follow> findByFollower(User follower);    // 팔로잉 목록
}
```

### 4.3 Service

```
- follow(followerId, followingId): 자기 자신 팔로우 방지, 중복 체크, Notification 발행
- unfollow(followerId, followingId): 삭제
- getFollowingIds(userId): 팔로잉 ID 목록
- getFollowers(userId): 팔로워 User 목록
- getFollowing(userId): 팔로잉 User 목록
- getFollowersCount(userId), getFollowingCount(userId)
```

### 4.4 Controller

```
POST   /api/users/{id}/follow       → follow()
DELETE /api/users/{id}/follow       → unfollow()
GET    /api/profile/following-ids   → getFollowingIds() (인증 필수)
```

### 산출물
- [ ] `Follow.java` 엔티티
- [ ] `FollowRepository.java`
- [ ] `FollowService.java`
- [ ] `FollowController.java`
- [ ] `UserProfileResponse`에 followersCount/followingCount 반영
- [ ] `SecurityConfig` 업데이트
- [ ] 단위 테스트

---

## Step 5: Notification(알림) 도메인 구현

> **목표**: 팔로우·좋아요·멘션 알림 생성/조회/읽음처리

### 5.1 엔티티

**파일**: `src/main/java/com/example/sns/domain/Notification.java` (신규)

```java
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;               // 알림 받는 사람

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;   // FOLLOW, LIKE, MENTION

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;           // 알림 발생시킨 사람

    private Long postId;             // LIKE, MENTION 시 관련 게시글

    @Column(nullable = false)
    private boolean isRead = false;
}

public enum NotificationType {
    FOLLOW, LIKE, MENTION
}
```

### 5.2 Repository

```java
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    @Modifying @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);
}
```

### 5.3 Service

```
- create(userId, type, fromUserId, postId?): 알림 생성 (자기 자신에게는 생성하지 않음)
- getByUser(userId): 사용자 알림 목록
- markAsRead(notificationId, userId): 단건 읽음 (소유권 체크)
- markAllAsRead(userId): 전체 읽음
```

**알림 트리거 포인트**:
- `PostLikeService.like()` → `LIKE` 알림 (게시글 작성자에게)
- `FollowService.follow()` → `FOLLOW` 알림 (대상 사용자에게)

### 5.4 Controller

```
GET    /api/notifications            → getMyNotifications() (인증 필수)
POST   /api/notifications/{id}/read  → markAsRead()
POST   /api/notifications/read-all   → markAllAsRead()
```

### 5.5 Response DTO

```java
public record NotificationResponse(
    Long id,
    Long userId,
    String type,           // "follow", "like", "mention"
    Long fromUserId,
    String fromUserName,
    String fromUserProfilePic,
    Long postId,
    boolean isRead,
    String createdAt
) {}
```

### 산출물
- [ ] `Notification.java` 엔티티 + `NotificationType.java` enum
- [ ] `NotificationRepository.java`
- [ ] `NotificationService.java`
- [ ] `NotificationController.java`
- [ ] `NotificationResponse.java` DTO
- [ ] `PostLikeService`, `FollowService`에서 알림 발행 연동
- [ ] `SecurityConfig` 업데이트
- [ ] 단위 테스트

---

## Step 6: SavedRoute(경로 저장) 도메인 구현

> **목표**: 사용자가 계획한 경로를 저장/조회/삭제

### 6.1 엔티티

**파일**: `src/main/java/com/example/sns/domain/SavedRoute.java` (신규)

```java
@Entity
@Table(name = "saved_routes")
public class SavedRoute extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String points;         // JSON string: [{lat, lng}, ...]

    @Column(columnDefinition = "TEXT")
    private String path;           // JSON string: polyline path

    private Double distance;       // meters
    private Integer duration;      // seconds

    @Column(length = 20)
    private String transportMode;  // car, bike, walk
}
```

### 6.2 Repository

```java
public interface SavedRouteRepository extends JpaRepository<SavedRoute, Long> {
    List<SavedRoute> findByUserOrderByCreatedAtDesc(User user);
}
```

### 6.3 Service

```
- save(userId, request): 경로 저장
- getByUser(userId): 사용자 경로 목록
- delete(routeId, userId): 삭제 (소유권 체크)
```

### 6.4 Controller

```
GET    /api/saved-routes       → getMyRoutes() (인증 필수)
POST   /api/saved-routes       → saveRoute()
DELETE /api/saved-routes/{id}  → deleteRoute()
```

### 산출물
- [ ] `SavedRoute.java` 엔티티
- [ ] `SavedRouteRepository.java`
- [ ] `SavedRouteService.java`
- [ ] `SavedRouteController.java`
- [ ] Request/Response DTO
- [ ] `SecurityConfig` 업데이트
- [ ] 단위 테스트

---

## Step 7: 사용자 검색 · 공개 프로필 API

> **목표**: 닉네임/이메일 기반 사용자 검색, 공개 프로필 조회

### 7.1 Controller

**파일**: `src/main/java/com/example/sns/controller/api/UserController.java` (신규)

```
GET /api/users/search?q={keyword}  → 닉네임/이메일 부분 매칭 검색 (인증 필수)
GET /api/users/{id}                → 공개 프로필 조회 (followersCount, followingCount 포함)
```

### 7.2 Service 확장

기존 `MemberService`에 메서드 추가:
```
- searchUsers(keyword): UserRepository의 기존 search 쿼리 활용
- getPublicProfile(userId): User + followersCount + followingCount 조합
```

### 7.3 응답 형식

`UserProfileResponse` (Step 2에서 정의)를 사용하되:
- `followersCount`: FollowRepository.countByFollowing()
- `followingCount`: FollowRepository.countByFollower()

### 산출물
- [ ] `UserController.java` (신규)
- [ ] `MemberService`에 searchUsers, getPublicProfile 메서드 추가
- [ ] `SecurityConfig` 업데이트
- [ ] 단위 테스트

---

## Step 8: Kakao 경로 프록시 호환 API

> **목표**: 프론트엔드의 `/api/route` 호출을 기존 MapController와 연결

### 문제

프론트엔드는 `/api/route?origin=lng,lat&destination=lng,lat&mode=car&priority=RECOMMEND` 형식으로 호출하지만, 기존 MapController는 `/api/map/directions?originLat=&originLng=&destLat=&destLng=&transportMode=CAR` 형식입니다.

### 해결 방안: 호환 엔드포인트 추가

**파일**: `src/main/java/com/example/sns/controller/api/MapController.java` (기존 파일 수정)

```
GET /api/route → 프론트 파라미터 파싱 → 기존 MapService 호출 → 프론트 기대 형식으로 응답 변환
```

**파라미터 변환**:
- `origin=126.978,37.566` → `originLng=126.978, originLat=37.566`
- `destination=127.0,37.5` → `destLng=127.0, destLat=37.5`
- `mode=car` → `transportMode=CAR`
- `priority=RECOMMEND` → `routeType=RECOMMEND`
- `waypoints=126.98,37.57|127.0,37.56` → 경유지 배열

**응답 변환** (프론트엔드 기대):
```json
{
  "routes": [{
    "sections": [...],
    "summary": { "distance": 1234, "duration": 300 }
  }]
}
```

### 산출물
- [ ] `MapController.java`에 `/api/route` GET 엔드포인트 추가
- [ ] 파라미터·응답 변환 로직
- [ ] 단위 테스트

---

## Step 9: 프론트엔드 필드 매핑 동기화

> **목표**: 백엔드 DTO 변경 후 프론트엔드가 정상 동작하도록 최종 확인

### 9.1 프론트엔드 types.ts 확인

Step 2의 `@JsonProperty` 별칭이 적용되면 프론트엔드 `types.ts`의 필드명과 일치해야 함:
- `userId`, `userName`, `lat`, `lng` ← 백엔드에서 별칭 제공

### 9.2 API 경로 확인

| 프론트 호출 | 백엔드 엔드포인트 | 매핑 |
|-----------|-----------------|------|
| `api.get('/posts')` | GET `/api/posts` | ✓ (리스트 반환 필요, Page가 아닌 배열) |
| `api.get('/pins')` | GET `/api/pins` | ✓ (리스트 반환 필요) |
| `api.post('/posts', body)` | POST `/api/posts` | ✓ (category, imageUrl 필드 추가) |
| `api.post('/pins', body)` | POST `/api/pins` | ✓ (title, category 필드 추가) |

### 9.3 주의: Page vs Array 응답

기존 Spring Boot는 `Page<PostResponse>`를 반환하지만, 프론트엔드 useMapSNS는 단순 배열을 기대합니다.

**해결 방안**: 컨트롤러에 `unpaged` 파라미터 지원 또는 별도 엔드포인트 추가
```
GET /api/posts?unpaged=true → List<PostResponse> 반환
```
또는 프론트엔드에서 `.data.content`로 접근하도록 수정.

### 산출물
- [ ] 응답 형식 정렬 (Page vs Array)
- [ ] 프론트엔드 useMapSNS.ts API 호출 결과 파싱 수정 (필요 시)
- [ ] 수동 E2E 테스트

---

## Step 10: 통합 테스트 · 빌드 검증

> **목표**: 전체 시스템 정상 동작 확인

### 10.1 백엔드 빌드

```bash
./gradlew clean build
```

### 10.2 프론트엔드 빌드

```bash
cd web && npm run build
```

### 10.3 통합 테스트 시나리오

| 시나리오 | 검증 항목 |
|---------|----------|
| 회원가입 → 로그인 | /members → /auth/login → /auth/me |
| 게시글 CRUD | /posts 생성/조회/수정 (category, imageUrl 포함) |
| 핀 CRUD | /pins 생성/조회 (title, category 포함) |
| 좋아요 | /posts/{id}/like → likesCount 증가 → /profile/liked-post-ids |
| 팔로우 | /users/{id}/follow → followersCount 증가 → /profile/following-ids |
| 알림 | 좋아요/팔로우 시 알림 생성 → /notifications → /notifications/{id}/read |
| 경로 저장 | /route 경로 조회 → /saved-routes 저장/삭제 |
| 사용자 검색 | /users/search?q=keyword |
| 프로필 수정 | /me (bio, profilePic 업데이트) |

### 산출물
- [ ] `./gradlew clean build` 성공
- [ ] `npm run build` 성공
- [ ] 통합 테스트 시나리오 통과

---

## Workflow (실행 순서 · 의존 관계)

```
Phase A — 기반 작업 (의존성 없음, 병렬 가능)
├─ Step 1: 엔티티 확장
├─ Step 6: SavedRoute 도메인 (독립)
└─ Step 8: 경로 프록시 호환 (독립)

Phase B — 핵심 소셜 기능 (Step 1 완료 후)
├─ Step 2: 응답 DTO 매핑 (Step 1 의존)
├─ Step 3: Like 도메인 (Step 1 의존)
└─ Step 4: Follow 도메인 (Step 1 의존)

Phase C — 알림 · 검색 (Step 3, 4 완료 후)
├─ Step 5: Notification (Step 3, 4 의존 — 알림 트리거)
└─ Step 7: 사용자 검색 · 프로필 (Step 4 의존 — followCount)

Phase D — 통합 (전체 완료 후)
├─ Step 9: 프론트엔드 동기화
└─ Step 10: 빌드 · 테스트

의존 그래프:
  Step 1 ──┬──→ Step 2
           ├──→ Step 3 ──→ Step 5
           └──→ Step 4 ──→ Step 5
                      └──→ Step 7
  Step 6 (독립)
  Step 8 (독립)
  Step 9 ← (Step 2~8 전체)
  Step 10 ← (Step 9)
```

### 예상 작업 순서

```
1. [Phase A] Step 1 + Step 6 + Step 8  (병렬)
2. [Phase B] Step 2 + Step 3 + Step 4  (병렬, Step 1 완료 후)
3. [Phase C] Step 5 + Step 7           (병렬, Step 3,4 완료 후)
4. [Phase D] Step 9 → Step 10          (순차)
```

---

## 파일 생성/수정 요약

### 신규 파일 (13개)

| 파일 | Step |
|------|------|
| `domain/PostLike.java` | 3 |
| `domain/Follow.java` | 4 |
| `domain/Notification.java` + `NotificationType.java` | 5 |
| `domain/SavedRoute.java` | 6 |
| `repository/PostLikeRepository.java` | 3 |
| `repository/FollowRepository.java` | 4 |
| `repository/NotificationRepository.java` | 5 |
| `repository/SavedRouteRepository.java` | 6 |
| `service/PostLikeService.java` | 3 |
| `service/FollowService.java` | 4 |
| `service/NotificationService.java` | 5 |
| `service/SavedRouteService.java` | 6 |
| `controller/api/PostLikeController.java` | 3 |
| `controller/api/FollowController.java` | 4 |
| `controller/api/NotificationController.java` | 5 |
| `controller/api/SavedRouteController.java` | 6 |
| `controller/api/UserController.java` | 7 |
| `dto/response/UserProfileResponse.java` | 2 |
| `dto/response/NotificationResponse.java` | 5 |
| `dto/response/SavedRouteResponse.java` | 6 |
| `dto/request/SavedRouteCreateRequest.java` | 6 |

### 수정 파일 (10개+)

| 파일 | Step | 변경 내용 |
|------|------|----------|
| `domain/User.java` | 1 | bio, profilePic 필드 |
| `domain/Post.java` | 1 | imageUrl, category 필드 |
| `domain/Pin.java` | 1 | title, category 필드 |
| `dto/response/PostResponse.java` | 2 | 별칭 + 새 필드 |
| `dto/response/PinResponse.java` | 2 | 별칭 + 새 필드 |
| `dto/request/PostCreateRequest.java` | 2 | imageUrl, category 필드 |
| `dto/request/PinCreateRequest.java` | 2 | title, category 필드 |
| `service/PostService.java` | 3 | likesCount, isLiked 조회 |
| `service/MemberService.java` | 7 | searchUsers, getPublicProfile |
| `controller/api/MapController.java` | 8 | /api/route 호환 엔드포인트 |
| `config/auth/SecurityConfig.java` | 3~7 | 새 엔드포인트 권한 |
| `dto/request/MemberUpdateRequest.java` | 1 | bio, profilePic |
