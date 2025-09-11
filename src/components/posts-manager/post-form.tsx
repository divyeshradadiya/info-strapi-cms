'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Post, PostFormData, Category } from '@/data/services/posts-api';
import { MarkdownText } from '../custom/markdown-text';

interface PostFormProps {
  post?: Post | null;
  categories: Category[];
  onSubmit: (formData: PostFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({
  post,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    content: '',
    slug: '',
    categoryId: '',
    image: undefined
  });

  useEffect(() => {
    if (post) {
      // Extract category ID with multiple fallbacks
      let categoryId = '';
      if (post.category) {
        categoryId = post.category.id?.toString() ||
                     post.category.documentId?.toString() ||
                     '';
      }

      setFormData({
        title: post.title,
        description: post.description || '',
        content: post.content || '',
        slug: post.slug,
        categoryId: categoryId,
        image: undefined
      });
    } else {
      // Reset form for new post
      setFormData({
        title: '',
        description: '',
        content: '',
        slug: '',
        categoryId: '',
        image: undefined
      });
    }
  }, [post]);

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="auto-generated"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the post"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        {/* <MarkdownEditor
          content={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="Write your post content here using markdown..."
          className="min-h-[300px]"
          outputFormat="html"
        /> */}
           <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Write your post content here... (Note: Blocks/rich content editing available in Strapi admin)"
          rows={6}
        />

      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        {post?.category ? (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              {post.category.text || 'Category'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {post.status || ''}
            </span>
          </div>
        ) : null}
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, categoryId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (post ? 'Updating...' : 'Creating...') : (post ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
};
