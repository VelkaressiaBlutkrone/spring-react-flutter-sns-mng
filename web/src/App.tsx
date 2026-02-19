import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AdminRoute } from '@/components/AdminRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import MePage from '@/pages/MePage';
import MeEditPage from '@/pages/MeEditPage';
import AboutPage from '@/pages/AboutPage';
import PinPostsPage from '@/pages/PinPostsPage';
import PostListPage from '@/pages/PostListPage';
import PostDetailPage from '@/pages/PostDetailPage';
import PostCreatePage from '@/pages/PostCreatePage';
import PostEditPage from '@/pages/PostEditPage';
import ImagePostListPage from '@/pages/ImagePostListPage';
import ImagePostDetailPage from '@/pages/ImagePostDetailPage';
import ImagePostCreatePage from '@/pages/ImagePostCreatePage';
import ImagePostEditPage from '@/pages/ImagePostEditPage';
import {
  AdminMemberListPage,
  AdminMemberFormPage,
  AdminPostListPage,
  AdminImagePostListPage,
  AdminPostEditPage,
  AdminImagePostEditPage,
} from '@/pages/admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<Navigate to="/" replace />} />
      <Route path="/pins/:id/posts" element={<PinPostsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/me"
        element={
          <PrivateRoute>
            <MePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/me/edit"
        element={
          <PrivateRoute>
            <MeEditPage />
          </PrivateRoute>
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/posts" element={<PostListPage />} />
      <Route path="/posts/create" element={<PrivateRoute><PostCreatePage /></PrivateRoute>} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/posts/:id/edit" element={<PrivateRoute><PostEditPage /></PrivateRoute>} />
      <Route path="/image-posts" element={<ImagePostListPage />} />
      <Route path="/image-posts/create" element={<PrivateRoute><ImagePostCreatePage /></PrivateRoute>} />
      <Route path="/image-posts/:id" element={<ImagePostDetailPage />} />
      <Route path="/image-posts/:id/edit" element={<PrivateRoute><ImagePostEditPage /></PrivateRoute>} />
      <Route
        path="/admin/members"
        element={
          <AdminRoute>
            <AdminMemberListPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/members/new"
        element={
          <AdminRoute>
            <AdminMemberFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/members/:id/edit"
        element={
          <AdminRoute>
            <AdminMemberFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <AdminRoute>
            <AdminPostListPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/posts/:id/edit"
        element={
          <AdminRoute>
            <AdminPostEditPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/image-posts"
        element={
          <AdminRoute>
            <AdminImagePostListPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/image-posts/:id/edit"
        element={
          <AdminRoute>
            <AdminImagePostEditPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
