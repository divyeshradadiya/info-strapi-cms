import { NextRequest, NextResponse } from 'next/server';
import { publicSdk } from '@/lib/sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sort = searchParams.get('sort') || 'createdAt:desc';
    const title = searchParams.get('title') || '';

    // Use the same SDK that works for blog pages
    const posts = await publicSdk.collection('posts').find({
      populate: {
        image: {
          fields: ['url', 'alternativeText', 'name'],
        },
        category: {
          fields: ['text'],
        },
      },
      filters: title ? {
        title: { $containsi: title }
      } : {},
      pagination: {
        page: page,
        pageSize: pageSize,
      },
      sort: [sort.replace(':', ':')], // convert "createdAt:desc" to proper format
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Content Manager API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, return a placeholder response
    // You can implement create functionality using SDK here
    return NextResponse.json(
      { message: 'Create functionality coming soon' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Content Manager Create Error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}