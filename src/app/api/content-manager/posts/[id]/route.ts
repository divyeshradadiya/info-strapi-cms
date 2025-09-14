import { NextRequest, NextResponse } from 'next/server';
import { publicSdk } from '@/lib/sdk';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;

    // Use the same SDK that works for blog pages
    const post = await publicSdk.collection('posts').findOne(id, {
      populate: {
        image: {
          fields: ['url', 'alternativeText', 'name'],
        },
        category: {
          fields: ['text'],
        },
        blocks: {
          on: {
            'blocks.video': {
              populate: {
                image: {
                  fields: ['url', 'alternativeText', 'name'],
                },
              },
            },
            'blocks.text': {
              populate: '*',
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Content Manager Get Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // For now, return a placeholder response
    // You can implement update functionality using SDK here
    return NextResponse.json(
      { message: 'Update functionality coming soon' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Content Manager Update Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    
    // For now, return a placeholder response
    // You can implement delete functionality using SDK here
    return NextResponse.json(
      { message: 'Delete functionality coming soon' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Content Manager Delete Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}