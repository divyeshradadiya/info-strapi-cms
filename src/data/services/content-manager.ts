'use client';

import { getStrapiURL } from "@/lib/utils";

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
  // Get content items for a specific content type using direct fetch to public API
  async getContentItems(contentType: string, params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string;
  }): Promise<ApiResponse<ContentItem[]>> {
    try {
      const collectionName = this.getCollectionName(contentType);
      
      // Build query parameters like your blog pages do
      const searchParams = new URLSearchParams();
      
      // Add pagination
      if (params?.page) {
        searchParams.append('pagination[page]', params.page.toString());
      }
      if (params?.pageSize) {
        searchParams.append('pagination[pageSize]', params.pageSize.toString());
      }
      
      // Add populate
      if (params?.populate) {
        searchParams.append('populate', params.populate);
      } else {
        // Default populate like your blog pages
        searchParams.append('populate[image][fields][0]', 'url');
        searchParams.append('populate[image][fields][1]', 'alternativeText');
        searchParams.append('populate[image][fields][2]', 'name');
        searchParams.append('populate[category][fields][0]', 'text');
      }
      
      // Add filters
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(`filters[${key}][$containsi]`, value.toString());
          }
        });
      }
      
      // Add sorting
      if (params?.sort) {
        searchParams.append('sort', params.sort);
      }

      const url = `${BASE_URL}/api/${collectionName}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType}: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform response to match our ContentItem interface
      const transformedData = result.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        attributes: item, // Strapi 5 flattened format
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
      }));
      
      return {
        data: transformedData,
        meta: result.meta,
      };
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      throw error;
    }
  }

  // Get single content item using direct fetch to public API
  async getContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      const collectionName = this.getCollectionName(contentType);
      
      const url = `${BASE_URL}/api/${collectionName}/${id}?populate=*`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType} item: ${response.status}`);
      }

      const result = await response.json();

      // Transform response to match our ContentItem interface
      const transformedData = {
        id: result.data.id,
        documentId: result.data.documentId,
        attributes: result.data,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
        publishedAt: result.data.publishedAt,
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
