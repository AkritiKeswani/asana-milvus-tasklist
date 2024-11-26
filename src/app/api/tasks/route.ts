import { NextResponse } from 'next/server';
import { taskVectorStore } from '@/utils/taskVectorStore';

export async function GET(request: Request) {
  try {
    // First check if collection exists
    const exists = await taskVectorStore.collectionExists();
    if (!exists) {
      console.log('Collection does not exist, creating...');
      await taskVectorStore.createCollection();
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    console.log('Fetching tasks with filter:', filter);
    const tasks = await taskVectorStore.getTasks(filter);
    
    console.log(`Successfully fetched ${tasks.length} tasks`);
    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Error in tasks route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tasks',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      },
      { status: 500 }
    );
  }
}