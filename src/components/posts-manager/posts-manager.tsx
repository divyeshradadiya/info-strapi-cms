'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { LoginForm } from './login-form';
import { LoadingScreen } from './loading-screen';
import { PostsHeader } from './posts-header';
import { PostsList } from './posts-list';
import {
  getPostsServerAction,
  getCategoriesServerAction,
  createPostServerAction,
  updatePostServerAction,
  deletePostServerAction,
  createCategoryServerAction,
  updateCategoryServerAction,
  deleteCategoryServerAction,
  publishPostServerAction,
  unpublishPostServerAction
} from '@/data/actions/content-manager';

// Types
interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface Post {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  content?: string;
  slug: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  category?: {
    id: number;
    documentId: string;
    text: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string | null;
  };
  image?: {
    id: number;
    documentId: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    url: string;
    mime: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PostFormData {
  title: string;
  description: string;
  content: string;
  slug: string;
  categoryId: string;
  image?: File;
}

interface CategoryFormData {
  name: string;
  slug: string;
}

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
    setLoading(true);
    try {
      const result = await getPostsServerAction(page, searchTerm, '');

      // Transform the data to match the expected format
      const transformedPosts = result.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        title: item.title,
        description: item.description,
        content: item.content,
        slug: item.slug,
        publishedAt: item.publishedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.publishedAt ? 'published' : 'draft',
        image: item.image,
        category: item.category,
      }));

      setPosts(transformedPosts || []);
      setCurrentPage(result.meta?.pagination?.page || 1);
      setTotalPages(result.meta?.pagination?.pageCount || 1);
    } catch (error) {
      console.error('Load posts error:', error);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategoriesData = useCallback(async () => {
    try {
      const result = await getCategoriesServerAction();

      // Transform the data to match the expected format
      const transformedCategories = result.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.text, // Map 'text' to 'name'
        slug: item.text?.toLowerCase().replace(/\s+/g, '-'), // Generate slug from text
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: 'published', // Default status
      }));

      setCategories(transformedCategories || []);
    } catch (error) {
      console.error('Load categories error:', error);
      showToast('Failed to load categories', 'error');
    }
  }, []);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPostsData();
      loadCategoriesData();
    }
  }, [isAuthenticated, loadPostsData, loadCategoriesData]);

  // CRUD operations
  const handleCreatePost = useCallback(async (formData: PostFormData) => {
    try {
      const postData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        slug: formData.slug,
        category: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        // Note: Image upload would need additional handling
      };

      const result = await createPostServerAction(postData);
      const createdPost = result.data as any;

      showToast('Post created successfully!', 'success');
      loadPostsData();
    } catch (error) {
      console.error('Create post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [loadPostsData]);

  const handleUpdatePost = useCallback(async (postId: string, formData: PostFormData) => {
    try {
      const postData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        slug: formData.slug,
        category: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        // Note: Image upload would need additional handling
      };

      await updatePostServerAction(postId, postData);
      showToast('Post updated successfully!', 'success');
      loadPostsData();
    } catch (error) {
      console.error('Update post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [loadPostsData]);

  const handleDeletePost = useCallback(async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      await deletePostServerAction(post.documentId);
      showToast('Post deleted successfully!', 'success');
      loadPostsData();
    } catch (error) {
      console.error('Delete post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      showToast(errorMessage, 'error');
    }
  }, [loadPostsData]);

  const handleTogglePublish = useCallback(async (post: Post) => {
    const isPublishing = !post.publishedAt;

    try {
      if (isPublishing) {
        await publishPostServerAction(post.documentId);
        showToast('Post published successfully!', 'success');
      } else {
        await unpublishPostServerAction(post.documentId);
        showToast('Post unpublished successfully!', 'success');
      }
      loadPostsData();
    } catch (error) {
      console.error(`${isPublishing ? 'Publish' : 'Unpublish'} post error:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isPublishing ? 'publish' : 'unpublish'} post`;
      showToast(errorMessage, 'error');
    }
  }, [loadPostsData]);

  const handleCreateCategory = useCallback(async (formData: CategoryFormData) => {
    try {
      const categoryData = {
        text: formData.name,
        // Note: Description and other fields would need to be added to the form
      };

      await createCategoryServerAction(categoryData);
      showToast('Category created successfully!', 'success');
      loadCategoriesData();
    } catch (error) {
      console.error('Create category error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [loadCategoriesData]);

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
