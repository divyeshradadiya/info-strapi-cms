// API service for Posts Manager - handles all Strapi API interactions

const API_BASE = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Types
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface Post {
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

export interface PostFormData {
  title: string;
  description: string;
  content: string;
  slug: string;
  categoryId: string;
  image?: File;
}

export interface CategoryFormData {
  name: string;
  slug: string;
}

// Admin Authentication
export const adminLogin = async (email: string, password: string): Promise<string> => {
  console.log('Attempting admin login with:', { email, password: '***' });
  
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();
  console.log('Admin login response:', response.status, data);

  if (!response.ok) {
    throw new Error(data.error?.message || `Admin login failed: ${response.status}`);
  }

  return data.data.token;
};

// Load Posts
export const loadPosts = async (
  authToken: string, 
  page: number = 1, 
  searchTerm: string = ''
): Promise<{ posts: Post[], pagination: any }> => {
  if (!authToken) {
    throw new Error('No auth token available');
  }

  const params = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': '10',
    'populate[category]': 'true',
    'populate[image]': 'true',
    'populate[blocks]': 'true',
    'sort': 'createdAt:desc',
    'status': 'draft' // Gets both draft and published documents
  });

  if (searchTerm) {
    params.append('filters[title][$containsi]', searchTerm);
  }

  console.log('Loading posts with token:', authToken ? 'Present' : 'Missing');
  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post?${params}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Load posts response:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Load posts error:', errorData);
    throw new Error(`Failed to load posts: ${response.status}`);
  }

  const data = await response.json();
  console.log('Posts loaded:', data);
  
  return {
    posts: data.results || [],
    pagination: data.pagination || {}
  };
};

// Load Categories
export const loadCategories = async (authToken: string): Promise<Category[]> => {
  if (!authToken) {
    throw new Error('No auth token available for loading categories');
  }
  
  console.log('Loading categories with token:', authToken ? 'Present' : 'Missing');
  
  // Try multiple approaches to load categories
  const attempts = [
    // 1. Content Manager API with status=draft
    {
      url: `${API_BASE}/content-manager/collection-types/api::category.category?status=draft`,
      method: 'GET',
      name: 'Content Manager (draft)'
    },
    // 2. Content Manager API without status
    {
      url: `${API_BASE}/content-manager/collection-types/api::category.category`,
      method: 'GET', 
      name: 'Content Manager (no status)'
    },
    // 3. REST API
    {
      url: `${API_BASE}/api/categories?populate=*`,
      method: 'GET',
      name: 'REST API'
    },
    // 4. REST API without populate
    {
      url: `${API_BASE}/api/categories`,
      method: 'GET',
      name: 'REST API (simple)'
    }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name}...`);
      
      const response = await fetch(attempt.url, {
        method: attempt.method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`${attempt.name} response:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`Categories from ${attempt.name}:`, data);
        
        // Handle both API response formats and transform data
        const rawCategories = data.results || data.data || [];
        
        if (rawCategories.length > 0 || data.results === null || data.data === null) {
          // Transform the category data to match our expected structure
          const transformedCategories = rawCategories.map((cat: any) => ({
            id: cat.id,
            documentId: cat.documentId,
            name: cat.text || cat.name || cat.attributes?.text || cat.attributes?.name || 'Unknown Category',
            slug: cat.slug || cat.attributes?.slug || (cat.text || cat.name || 'unknown').toLowerCase().replace(/\s+/g, '-'),
            description: cat.description || cat.attributes?.description || '',
            createdAt: cat.createdAt || cat.attributes?.createdAt,
            updatedAt: cat.updatedAt || cat.attributes?.updatedAt,
            publishedAt: cat.publishedAt || cat.attributes?.publishedAt
          }));
          
          console.log('Transformed categories:', transformedCategories);
          return transformedCategories;
        }
      } else {
        const errorData = await response.text();
        console.warn(`${attempt.name} failed:`, response.status, errorData);
      }
    } catch (error) {
      console.warn(`${attempt.name} error:`, error);
    }
  }

  console.error('All category loading attempts failed');
  return [];
};

// Create Post
export const createPost = async (authToken: string, postData: PostFormData): Promise<Post> => {
  const createData = {
    title: postData.title,
    description: postData.description,
    content: postData.content,
    slug: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-'),
    category: postData.categoryId ? { 
      connect: [{ id: postData.categoryId }] 
    } : undefined,
  };

  console.log('Creating post with data:', createData);

  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(createData),
  });

  const result = await response.json();
  console.log('Create post response:', response.status, result);

  if (!response.ok) {
    throw new Error(result.error?.message || `Failed to create post: ${response.status}`);
  }

  // Auto-publish the newly created post
  if (result.documentId) {
    try {
      await publishPost(authToken, result.documentId);
      console.log('Post auto-published successfully');
    } catch (publishError) {
      console.error('Auto-publish error:', publishError);
      // Don't throw error here, post was created successfully
    }
  }

  return result;
};

// Update Post
export const updatePost = async (authToken: string, documentId: string, postData: PostFormData): Promise<Post> => {
  const updateData = {
    title: postData.title,
    description: postData.description,
    content: postData.content,
    slug: postData.slug,
    category: postData.categoryId ? { 
      connect: [{ id: postData.categoryId }] 
    } : undefined,
  };

  console.log('Updating post with data:', updateData);

  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(updateData),
  });

  const result = await response.json();
  console.log('Update post response:', response.status, result);

  if (!response.ok) {
    throw new Error(result.error?.message || `Failed to update post: ${response.status}`);
  }

  return result;
};

// Delete Post
export const deletePost = async (authToken: string, documentId: string): Promise<void> => {
  console.log('Deleting post:', documentId);

  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Delete post response:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Delete post error:', errorData);
    throw new Error(`Failed to delete post: ${response.status}`);
  }
};

// Publish Post
export const publishPost = async (authToken: string, documentId: string): Promise<void> => {
  console.log('Publishing post:', documentId);

  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post/${documentId}/actions/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Publish post response:', response.status);

  if (!response.ok) {
    const result = await response.json();
    console.error('Publish error:', result);
    throw new Error(result.error?.message || `Failed to publish post: ${response.status}`);
  }
};

// Unpublish Post
export const unpublishPost = async (authToken: string, documentId: string): Promise<void> => {
  console.log('Unpublishing post:', documentId);

  const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post/${documentId}/actions/unpublish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Unpublish post response:', response.status);

  if (!response.ok) {
    const result = await response.json();
    console.error('Unpublish error:', result);
    throw new Error(result.error?.message || `Failed to unpublish post: ${response.status}`);
  }
};

// Create Category
export const createCategory = async (authToken: string, categoryData: CategoryFormData): Promise<Category> => {
  const createData = {
    text: categoryData.name, // Use 'text' field as per your Strapi model
    description: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'), // Use description for slug-like data
  };

  console.log('Creating category with data:', createData);

  // Try Content Manager API first
  let response = await fetch(`${API_BASE}/content-manager/collection-types/api::category.category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(createData),
  });

  // If Content Manager API fails, try REST API
  if (!response.ok) {
    console.log('Content Manager API failed, trying REST API for category creation...');
    response = await fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ data: createData }),
    });
  }

  const result = await response.json();
  console.log('Create category response:', response.status, result);

  if (!response.ok) {
    throw new Error(result.error?.message || `Failed to create category: ${response.status}`);
  }

  return result.data || result;
};
