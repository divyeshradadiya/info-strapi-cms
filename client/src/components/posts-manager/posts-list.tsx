'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Tag, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { PostCard } from './post-card';
import { PostForm } from './post-form';
import { CategoryForm } from './category-form';
import { Post, Category, PostFormData, CategoryFormData } from '@/data/services/posts-api';
import { useAuth } from './auth-context';

interface PostsListProps {
  posts: Post[];
  categories: Category[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onLoadPosts: (page?: number, searchTerm?: string) => void;
  onLoadCategories: () => void;
  onCreatePost: (formData: PostFormData) => Promise<void>;
  onUpdatePost: (postId: string, formData: PostFormData) => Promise<void>;
  onDeletePost: (post: Post) => void;
  onTogglePublish: (post: Post) => void;
  onCreateCategory: (formData: CategoryFormData) => Promise<void>;
}

export const PostsList: React.FC<PostsListProps> = ({
  posts,
  categories,
  loading,
  currentPage,
  totalPages,
  onLoadPosts,
  onLoadCategories,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onTogglePublish,
  onCreateCategory,
}) => {
  const { authToken, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search functionality
  useEffect(() => {
    if (authToken) {
      const timeoutId = setTimeout(() => {
        onLoadPosts(1, searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, authToken]); // Removed onLoadPosts from dependencies

  const handleCreatePost = async (formData: PostFormData) => {
    setIsSubmitting(true);
    try {
      await onCreatePost(formData);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (formData: PostFormData) => {
    if (!editingPost) return;
    setIsSubmitting(true);
    try {
      await onUpdatePost(editingPost.documentId, formData);
      setIsEditModalOpen(false);
      setEditingPost(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleCreateCategory = async (formData: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateCategory(formData);
      setIsCategoryModalOpen(false);
      onLoadCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="flex flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="whitespace-nowrap text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="flex gap-2">

          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Tag className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleCreateCategory}
                onCancel={() => setIsCategoryModalOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <PostForm
                categories={categories}
                onSubmit={handleCreatePost}
                onCancel={() => setIsCreateModalOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h3 className="mt-2 text-lg font-medium text-foreground">No posts found</h3>
          <p className="mt-1 text-muted-foreground">Get started by creating your first post.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.documentId}
              post={post}
              onEdit={handleEditPost}
              onDelete={onDeletePost}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadPosts(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadPosts(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <PostForm
            post={editingPost}
            categories={categories}
            onSubmit={handleUpdatePost}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
