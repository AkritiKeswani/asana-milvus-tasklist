import { NextResponse } from 'next/server';
import { taskVectorStore } from '@/utils/taskVectorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    // Get tasks based on filter
    const tasks = await taskVectorStore.getTasks(filter);
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error in tasks route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}