import { NextRequest, NextResponse } from 'next/server';
import { publicSdk } from '@/lib/sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Use the same SDK that works for blog pages
    const categories = await publicSdk.collection('categories').find({
      fields: ['text', 'description'],
      pagination: {
        page: page,
        pageSize: pageSize,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Content Manager Categories API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    console.error('Content Manager Create Category Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}