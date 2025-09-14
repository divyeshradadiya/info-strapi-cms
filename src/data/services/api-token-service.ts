// Alternative API Token-based service for production
import { getStrapiURL } from "@/lib/utils";

const API_BASE = getStrapiURL();

// For production, use API tokens instead of admin login
export class ApiTokenService {
  private apiToken: string;

  constructor(apiToken?: string) {
    // Use environment variable if no token provided
    this.apiToken = apiToken || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';
    if (!this.apiToken) {
      throw new Error('API token is required. Please set NEXT_PUBLIC_STRAPI_API_TOKEN in your environment variables.');
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`,
    };
  }

  // Load Posts using API token
  async loadPosts(page: number = 1, searchTerm: string = '') {
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': '10',
      'populate[category]': 'true',
      'populate[image]': 'true',
      'sort': 'createdAt:desc',
    });

    if (searchTerm) {
      params.append('filters[title][$containsi]', searchTerm);
    }

    const response = await fetch(`${API_BASE}/api/posts?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.status}`);
    }

    return response.json();
  }

  // Load Categories using API token
  async loadCategories() {
    const response = await fetch(`${API_BASE}/api/categories`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.status}`);
    }

    return response.json();
  }

  // Create Post using API token
  async createPost(postData: any) {
    const response = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ data: postData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.status}`);
    }

    return response.json();
  }

  // Update Post using API token
  async updatePost(documentId: string, postData: any) {
    const response = await fetch(`${API_BASE}/api/posts/${documentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ data: postData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.status}`);
    }

    return response.json();
  }

  // Delete Post using API token
  async deletePost(documentId: string) {
    const response = await fetch(`${API_BASE}/api/posts/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`);
    }

    return response.ok;
  }
}

// Export a configured instance using environment variable
export const apiTokenService = new ApiTokenService();