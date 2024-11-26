import { NextResponse } from 'next/server';
import { taskVectorStore } from '@/utils/taskVectorStore';
import { openAIEmbeddings } from '@/utils/openAI';

export async function POST(request: Request) {
  try {
    console.log('Prioritize API endpoint hit');
    
    const body = await request.json();
    console.log('Received request body:', body);

    const { query, userId } = body;

    // Validate required fields
    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Query and userId are required' },
        { status: 400 }
      );
    }

    // Initialize collections if needed
    console.log('Ensuring collection exists...');
    await taskVectorStore.createCollection();

    console.log('Getting prioritized tasks...');
    const prioritizedTasks = await taskVectorStore.getPrioritizedTasks(query, userId);
    console.log(`Found ${prioritizedTasks.length} tasks`);

    if (prioritizedTasks.length === 0) {
      return NextResponse.json({
        tasks: [],
        summary: "No tasks found for the given criteria."
      });
    }

    // Generate task description for OpenAI
    const tasksDescription = prioritizedTasks
      .map((task) => 
        `${task.name} (Priority: ${task.priorityScore.toFixed(2)}, Reasons: ${task.priorityReasons?.join(', ')})`
      )
      .join('\n');

    // Generate summary using OpenAI
    console.log('Generating summary...');
    const prompt = `Based on the user's query "${query}", here are the relevant tasks in order of priority:\n${tasksDescription}\n\nPlease provide a natural language summary of these tasks and their priorities, focusing on why they are ordered this way.`;
    
    const summary = await openAIEmbeddings.generateResponse(prompt);

    const response = {
      success: true,
      query,
      tasks: prioritizedTasks,
      summary,
      tasksFound: prioritizedTasks.length
    };

    console.log('Sending response with', prioritizedTasks.length, 'tasks');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in prioritize API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to prioritize tasks',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}