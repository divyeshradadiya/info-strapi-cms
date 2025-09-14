// Example usage of API Token Service

import { apiTokenService } from '@/data/services/api-token-service';

// Load posts
const loadPosts = async () => {
  try {
    const posts = await apiTokenService.loadPosts();
    console.log('Posts:', posts);
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

// Load categories
const loadCategories = async () => {
  try {
    const categories = await apiTokenService.loadCategories();
    console.log('Categories:', categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

// Create a post
const createPost = async () => {
  try {
    const newPost = await apiTokenService.createPost({
      title: 'New Post Title',
      content: 'Post content here',
      slug: 'new-post-slug',
      publishedAt: new Date().toISOString(),
    });
    console.log('Created post:', newPost);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};

export { loadPosts, loadCategories, createPost };