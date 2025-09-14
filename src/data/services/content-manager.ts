'use client';

import { getStrapiURL } from "@/lib/utils";
import sdk from "@/lib/sdk";

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

  // Get all content types
  async getContentTypes(): Promise<ContentType[]> {
    try {
      const response = await fetch(`${API_URL}/content-type-builder/content-types`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content types');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching content types:', error);
      // Fallback to common content types if API fails
      return [
        { uid: 'api::category.category', displayName: 'Category', singularName: 'category', pluralName: 'categories', kind: 'collectionType', attributes: {} },
        { uid: 'api::post.post', displayName: 'Post', singularName: 'post', pluralName: 'posts', kind: 'collectionType', attributes: {} },
        { uid: 'api::page.page', displayName: 'Page', singularName: 'page', pluralName: 'pages', kind: 'collectionType', attributes: {} },
        { uid: 'api::global.global', displayName: 'Global', singularName: 'global', pluralName: 'globals', kind: 'singleType', attributes: {} },
      ];
    }
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
  // Get content items for a specific content type using Strapi SDK
  async getContentItems(contentType: string, params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string;
  }): Promise<ApiResponse<ContentItem[]>> {
    try {
      const collectionName = this.getCollectionName(contentType);
      
      const query: any = {
        populate: params?.populate || '*',
      };

      // Add pagination
      if (params?.page || params?.pageSize) {
        query.pagination = {
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
        };
      }

      // Add filters
      if (params?.filters) {
        query.filters = {};
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            query.filters[key] = { $containsi: value };
          }
        });
      }

      // Add sorting
      if (params?.sort) {
        query.sort = params.sort;
      }

      const response = await sdk.collection(collectionName).find(query);
      
      // Transform SDK response to match our ContentItem interface
      const transformedData = response.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        attributes: item, // The SDK already flattens attributes
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
      }));
      
      return {
        data: transformedData,
        meta: response.meta,
      };
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      throw error;
    }
  }

  // Get single content item using Strapi SDK
  async getContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      // Convert content type UID to collection name (e.g., 'api::post.post' -> 'posts')
      const collectionName = contentType.split('.').pop() + 's';
      
      const response = await sdk.collection(collectionName).findOne(id, {
        populate: '*',
      });

      // Transform SDK response to match our ContentItem interface
      const transformedData = {
        id: response.data.id,
        documentId: response.data.documentId,
        attributes: response.data,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        publishedAt: response.data.publishedAt,
      };

      return { data: transformedData };
    } catch (error) {
      console.error(`Error fetching ${contentType} item:`, error);
      throw error;
    }
  }

  // Create content item
  async createContentItem(contentType: string, data: Record<string, any>): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${contentType} item`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error creating ${contentType} item:`, error);
      throw error;
    }
  }

  // Update content item
  async updateContentItem(contentType: string, id: string, data: Record<string, any>): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${contentType} item`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating ${contentType} item:`, error);
      throw error;
    }
  }

  // Delete content item
  async deleteContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${contentType} item`);
      }

      return await response.json();
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
