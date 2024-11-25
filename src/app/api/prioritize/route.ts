import { NextResponse } from 'next/server';
import { taskVectorStore } from '@/utils/taskVectorStore';
import { openAIEmbeddings } from '@/utils/openAI';

export async function POST(req: Request) {
  try {
    const { query, userId } = await req.json();

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Query and userId are required' },
        { status: 400 }
      );
    }

    console.log('Received query and userId:', { query, userId });

    const prioritizedTasks = await taskVectorStore.getPrioritizedTasks(query, userId);

    const tasksDescription = prioritizedTasks
      .map(
        (task) =>
          `${task.name} (Priority Score: ${task.priorityScore}, Reasons: ${task.priorityReasons.join(', ')})`
      )
      .join('\n');

    const prompt = `Based on the user's query "${query}", here are the relevant tasks in order of priority:\n${tasksDescription}\n\nPlease provide a natural language summary of these tasks and their priorities.`;

    console.log('Generated prompt for OpenAI:', prompt);

    const summary = await openAIEmbeddings.generateResponse(prompt);

    return NextResponse.json({
      tasks: prioritizedTasks,
      summary,
    });
  } catch (error) {
    console.error('Error in prioritize route:', error);
    return NextResponse.json(
      { error: 'Failed to prioritize tasks' },
      { status: 500 }
    );
  }
}