'use client';

import { AuthProvider } from '../posts-manager/auth-context';
import PostsManager from '../posts-manager/posts-manager';

const PostsManagerWithAuth = () => {
  return (
    <AuthProvider>
      <PostsManager />
    </AuthProvider>
  );
};

export default PostsManagerWithAuth;
