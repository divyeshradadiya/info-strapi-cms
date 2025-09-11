'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { LoginForm } from './login-form';
import { LoadingScreen } from './loading-screen';
import { PostsHeader } from './posts-header';
import { PostsList } from './posts-list';
import {
  loadPosts,
  loadCategories,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  createCategory,
  type Post,
  type Category,
  type PostFormData,
  type CategoryFormData
} from '@/data/services/posts-api';

// Toast utility function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

const PostsManager = () => {
  const { isAuthenticated, isInitializing, authToken } = useAuth();

  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load data functions
  const loadPostsData = useCallback(async (page = 1, searchTerm = '') => {
    if (!authToken) return;

    setLoading(true);
    try {
      const { posts: postsData, pagination } = await loadPosts(authToken, page, searchTerm);

      setPosts(postsData || []);
      setCurrentPage(pagination?.page || 1);
      setTotalPages(pagination?.pageCount || 1);
    } catch (error) {
      console.error('Load posts error:', error);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const loadCategoriesData = useCallback(async () => {
    if (!authToken) return;

    try {
      const categoriesData = await loadCategories(authToken);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Load categories error:', error);
      showToast('Failed to load categories', 'error');
    }
  }, [authToken]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadPostsData();
      loadCategoriesData();
    }
  }, [isAuthenticated, authToken, loadPostsData, loadCategoriesData]);

  // CRUD operations
  const handleCreatePost = useCallback(async (formData: PostFormData) => {
    try {
      const result = await createPost(authToken, formData);

      // Auto-publish the newly created post
      if (result.documentId) {
        try {
          await publishPost(authToken, result.documentId);
          showToast('Post created and published successfully!', 'success');
        } catch (publishError) {
          console.error('Auto-publish error:', publishError);
          showToast('Post created as draft (auto-publish failed)', 'success');
        }
      } else {
        showToast('Post created successfully!', 'success');
      }

      loadPostsData();
    } catch (error) {
      console.error('Create post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [authToken, loadPostsData]);

  const handleUpdatePost = useCallback(async (postId: string, formData: PostFormData) => {
    try {
      await updatePost(authToken, postId, formData);
      showToast('Post updated successfully!', 'success');
      loadPostsData();
    } catch (error) {
      console.error('Update post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [authToken, loadPostsData]);

  const handleDeletePost = useCallback(async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      await deletePost(authToken, post.documentId);
      showToast('Post deleted successfully!', 'success');
      loadPostsData();
    } catch (error) {
      console.error('Delete post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      showToast(errorMessage, 'error');
    }
  }, [authToken, loadPostsData]);

  const handleTogglePublish = useCallback(async (post: Post) => {
    const isPublishing = !post.publishedAt;

    try {
      if (isPublishing) {
        await publishPost(authToken, post.documentId);
        showToast('Post published successfully!', 'success');
      } else {
        await unpublishPost(authToken, post.documentId);
        showToast('Post unpublished successfully!', 'success');
      }

      loadPostsData();
    } catch (error) {
      console.error(`${isPublishing ? 'Publish' : 'Unpublish'} post error:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isPublishing ? 'publish' : 'unpublish'} post`;
      showToast(errorMessage, 'error');
    }
  }, [authToken, loadPostsData]);

  const handleCreateCategory = useCallback(async (formData: CategoryFormData) => {
    try {
      await createCategory(authToken, formData);
      showToast('Category created successfully!', 'success');
    } catch (error) {
      console.error('Create category error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [authToken]);

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Show main posts manager interface
  return (
    <div className="min-h-screen bg-background">
      {/* <PostsHeader /> */}
      <PostsList
        posts={posts}
        categories={categories}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onLoadPosts={loadPostsData}
        onLoadCategories={loadCategoriesData}
        onCreatePost={handleCreatePost}
        onUpdatePost={handleUpdatePost}
        onDeletePost={handleDeletePost}
        onTogglePublish={handleTogglePublish}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
};

export default PostsManager;
