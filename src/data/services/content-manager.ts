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

  setToken(token: string) {
    this.token = token;
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

  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.setToken(data.jwt);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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

  // Get content items for a specific content type
  async getContentItems(contentType: string, params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string;
  }): Promise<ApiResponse<ContentItem[]>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('pagination[page]', params.page.toString());
      if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.populate) searchParams.append('populate', params.populate);
      
      // Add filters
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(`filters[${key}][$containsi]`, value.toString());
          }
        });
      }

      const url = `${API_URL}/${contentType}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      throw error;
    }
  }

  // Get single content item
  async getContentItem(contentType: string, id: string): Promise<{ data: ContentItem }> {
    try {
      const response = await fetch(`${API_URL}/${contentType}/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType} item`);
      }

      return await response.json();
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
