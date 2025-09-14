import { getBlogPosts, getCategories, getBlogPostBySlug, getBlogPostsForAdmin } from "@/data/loaders";
import sdk, { authenticatedFetch } from "@/lib/sdk";

// Server actions that use the exact same functions as blog pages
export async function getPostsServerAction(page: number, query: string, category: string) {
  return await getBlogPostsForAdmin(page, query, category);
}

export async function getCategoriesServerAction() {
  return await getCategories();
}

export async function getPostBySlugServerAction(slug: string, status: string) {
  return await getBlogPostBySlug(slug, status);
}

// Additional server actions for CRUD operations using authenticated fetch
export async function createPostServerAction(data: any) {
  const result = await authenticatedFetch('/posts', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return { data: result.data };
}

export async function updatePostServerAction(id: string, data: any) {
  const result = await authenticatedFetch(`/posts/${id}`, {
    method: 'PUT', 
    body: JSON.stringify({ data }),
  });
  return { data: result.data };
}

export async function deletePostServerAction(id: string) {
  const result = await authenticatedFetch(`/posts/${id}`, {
    method: 'DELETE',
  });
  return { data: result.data };
}

export async function createCategoryServerAction(data: any) {
  const result = await authenticatedFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return { data: result.data };
}

export async function updateCategoryServerAction(id: string, data: any) {
  const result = await authenticatedFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return { data: result.data };
}

export async function deleteCategoryServerAction(id: string) {
  const result = await authenticatedFetch(`/categories/${id}`, {
    method: 'DELETE',
  });
  return { data: result.data };
}

export async function publishPostServerAction(id: string) {
  const result = await authenticatedFetch(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        publishedAt: new Date().toISOString(),
      },
    }),
  });
  return { data: result.data };
}

export async function unpublishPostServerAction(id: string) {
  const result = await authenticatedFetch(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        publishedAt: null,
      },
    }),
  });
  return { data: result.data };
}