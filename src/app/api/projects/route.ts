import { NextResponse } from 'next/server';
import { milvusClient, COLLECTIONS } from '@/utils/milvusClient';

export async function GET() {
  try {
    const projects = await milvusClient.query({
      collection_name: COLLECTIONS.PROJECTS,
      output_fields: ['id', 'name', 'description'],
    });
    
    return NextResponse.json({ projects: projects.data });
  } catch (error) {
    console.error('Error in projects route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}