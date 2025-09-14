'use client';

import { getStrapiURL } from "@/lib/utils";
import { getPostsServerAction, getCategoriesServerAction, getPostBySlugServerAction, createPostServerAction, updatePostServerAction, deletePostServerAction, createCategoryServerAction, updateCategoryServerAction, deleteCategoryServerAction } from "@/data/actions/content-manager";

const BASE_URL = getStrapiURL();
const API_URL = `${BASE_URL}/api`;

export interface ContentType {
  uid: string;
  displayName: string;
  singularName: string;
  pluralName: string;
  kind: 'collectionType' | 'singleType';
  attributes: Record<string, any>;
}

export interface ContentItem {
  id: number;
  documentId: string;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

class ContentManagerService {
  private token: string | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    // Check if user is already authenticated in localStorage
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('content-manager-auth');
      if (savedAuth === 'true') {
        this.isAuthenticated = true;
        this.token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || null;
      }
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Dummy Authentication using environment variables
  async login(email: string, password: string) {
    try {
      const envEmail = process.env.CONTENT_MANAGER_EMAIL || 'admin@example.com';
      const envPassword = process.env.CONTENT_MANAGER_PASSWORD || 'admin123';
      
      if (email === envEmail && password === envPassword) {
        this.isAuthenticated = true;
        this.token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || null;
        
        // Save authentication state in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('content-manager-auth', 'true');
        }
        
        return { success: true, message: 'Login successful' };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout function
  logout() {
    this.isAuthenticated = false;
    this.token = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('content-manager-auth');
    }
  }

  // Get all content types - using hardcoded list since we don't need admin API
  async getContentTypes(): Promise<ContentType[]> {
    // Return predefined content types instead of making API calls to admin endpoints
    return [
      { uid: 'api::category.category', displayName: 'Category', singularName: 'category', pluralName: 'categories', kind: 'collectionType', attributes: {} },
      { uid: 'api::post.post', displayName: 'Post', singularName: 'post', pluralName: 'posts', kind: 'collectionType', attributes: {} },
      { uid: 'api::page.page', displayName: 'Page', singularName: 'page', pluralName: 'pages', kind: 'collectionType', attributes: {} },
      { uid: 'api::global.global', displayName: 'Global', singularName: 'global', pluralName: 'globals', kind: 'singleType', attributes: {} },
    ];
  }

  // Helper function to convert content type UID to collection name
  private getCollectionName(contentTypeUid: string): string {
    // Map content type UIDs to collection names
    const mapping: Record<string, string> = {
      'api::post.post': 'posts',
      'api::category.category': 'categories',
      'api::page.page': 'pages',
      'api::global.global': 'global', // single type
    };
    
    return mapping[contentTypeUid] || contentTypeUid.split('.').pop() + 's';
  }
  // Get content items for a specific content type - using the exact same functions as blog pages
  async getContentItems(contentType: string, params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string;
  }): Promise<ApiResponse<ContentItem[]>> {
    try {
      // Use the exact same functions that work for blog pages
      if (contentType === 'api::post.post') {
        const page = params?.page || 1;
        const query = params?.filters?.title || '';
        const category = params?.filters?.category || '';

        const result = await getPostsServerAction(page, query, category);

        // Transform the result to match our ContentItem interface
        const transformedData = result.data.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,
          attributes: item,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt,
        }));

        return {
          data: transformedData,
          meta: result.meta,
        };
      }

      if (contentType === 'api::category.category') {
        const result = await getCategoriesServerAction();

        // Transform categories to match ContentItem interface
        const transformedData = result.data.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,
          attributes: item,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt,
        }));

        return {
          data: transformedData,
          meta: {
            pagination: {
              page: 1,
              pageSize: result.data.length,
              pageCount: 1,
              total: result.data.length,
            },
          },
        };
      }

      // For other content types, return empty array
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 0,
            pageCount: 1,
            total: 0,
          },
        },
      };
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      throw error;
    }
  }

  // Get single content item using the exact same function as blog pages
  async getContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      if (contentType === 'api::post.post') {
        // For posts, we need to get by slug, not ID
        // First get all posts and find the one with matching ID
        const result = await getPostsServerAction(1, '', '');
        const post = result.data.find((item: any) => item.id === parseInt(id));

        if (!post) {
          throw new Error(`Post with ID ${id} not found`);
        }

        return {
          data: {
            id: post.id,
            documentId: post.documentId,
            attributes: post,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            publishedAt: post.publishedAt,
          },
        };
      }

      // For other content types, return error for now
      throw new Error(`Getting individual ${contentType} items not implemented yet`);
    } catch (error) {
      console.error(`Error fetching ${contentType} item:`, error);
      throw error;
    }
  }

  // Create content item using the exact same SDK approach
  async createContentItem(contentType: string, data: Record<string, any>): Promise<{ data: ContentItem }> {
    try {
      if (contentType === 'api::post.post') {
        const result = await createPostServerAction(data);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      if (contentType === 'api::category.category') {
        const result = await createCategoryServerAction(data);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      throw new Error(`Creating ${contentType} items not implemented yet`);
    } catch (error) {
      console.error(`Error creating ${contentType} item:`, error);
      throw error;
    }
  }

  // Update content item using the exact same SDK approach
  async updateContentItem(contentType: string, id: string, data: Record<string, any>): Promise<{ data: ContentItem }> {
    try {
      if (contentType === 'api::post.post') {
        const result = await updatePostServerAction(id, data);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      if (contentType === 'api::category.category') {
        const result = await updateCategoryServerAction(id, data);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      throw new Error(`Updating ${contentType} items not implemented yet`);
    } catch (error) {
      console.error(`Error updating ${contentType} item:`, error);
      throw error;
    }
  }

  // Delete content item using the exact same SDK approach
  async deleteContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      if (contentType === 'api::post.post') {
        const result = await deletePostServerAction(id);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      if (contentType === 'api::category.category') {
        const result = await deleteCategoryServerAction(id);
        const item = result.data as any;
        return {
          data: {
            id: item.id,
            documentId: item.documentId,
            attributes: item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          },
        };
      }

      throw new Error(`Deleting ${contentType} items not implemented yet`);
    } catch (error) {
      console.error(`Error deleting ${contentType} item:`, error);
      throw error;
    }
  }

  // Publish content item
  async publishContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}/${id}/actions/publish`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to publish ${contentType} item`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error publishing ${contentType} item:`, error);
      throw error;
    }
  }

  // Unpublish content item
  async unpublishContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}/${id}/actions/unpublish`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to unpublish ${contentType} item`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error unpublishing ${contentType} item:`, error);
      throw error;
    }
  }

  // Upload media
  async uploadFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export const contentManagerService = new ContentManagerService();
