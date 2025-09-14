import { getStrapiURL } from "@/lib/utils";
import { strapi } from '@strapi/client';

const BASE_API_URL = getStrapiURL() + "/api";
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

console.log('Using API Token:', API_TOKEN ? `${API_TOKEN.substring(0, 20)}...` : 'No token');

// Public SDK for read operations
const sdk = strapi({
  baseURL: BASE_API_URL,
});

const publicSdk = strapi({
  baseURL: BASE_API_URL,
})

export { publicSdk };

// Simple authenticated fetch function - this will help us debug the token issue
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_API_URL}${endpoint}`;
  
  console.log('🔑 Using token:', API_TOKEN ? 'Token provided' : 'No token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  } else {
    console.error('❌ No API token found!');
    throw new Error('API token is missing');
  }
  
  console.log('📤 Request details:', {
    method: options.method || 'GET',
    url,
    hasAuth: !!headers.Authorization,
  });
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log('📥 Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error response:', errorText);
    
    if (response.status === 401) {
      console.error(`
🔥 401 UNAUTHORIZED ERROR 🔥

This means your API token is invalid. Please:

1. Go to your Strapi admin: http://localhost:1337/admin
2. Navigate to Settings > API Tokens
3. Delete the existing token
4. Create a new token with these settings:
   - Name: "Content Manager Token"
   - Description: "Token for content management"
   - Token duration: "Unlimited"
   - Token type: "Full access"
5. Copy the new token
6. Update your .env.local file with the new token
7. Restart your Next.js app

Current token (first 20 chars): ${API_TOKEN?.substring(0, 20)}...
      `);
    }
    
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
};

export default sdk;
