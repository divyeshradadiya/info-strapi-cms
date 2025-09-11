'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component to ensure it only runs on client
const PostsManager = dynamic(
  () => import('@/components/custom/posts-manager'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading Posts Manager...</p>
        </div>
      </div>
    )
  }
);

export default function ContentManagerPage() {
  return <PostsManager />;
}
