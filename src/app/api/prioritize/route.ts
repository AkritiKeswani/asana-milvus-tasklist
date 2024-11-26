import { NextResponse } from 'next/server';
import { taskVectorStore } from '@/utils/taskVectorStore';
import { openAIEmbeddings } from '@/utils/openAI';

// Add OPTIONS method for CORS support
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: Request) {
  console.log('🚀 API endpoint hit at:', new Date().toISOString());

  try {
    const body = await req.json();
    console.log('📝 Received body:', body);

    const { query, userId } = body;

    if (!query) {
      console.log('❌ Missing query parameter');
      return NextResponse.json({ 
        success: false, 
        error: 'Query is required' 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Test response first to ensure route is working
    return NextResponse.json({
      success: true,
      tasks: [
        {
          id: '1',
          name: 'Test Task',
          description: 'This is a test task',
          due_date: new Date().toISOString(),
          priorityScore: 0.95,
          priorityReasons: ['High priority test'],
          completed: false,
          modified_at: new Date().toISOString()
        }
      ],
      summary: 'Test summary response',
      tasksFound: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('❌ Error in API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}