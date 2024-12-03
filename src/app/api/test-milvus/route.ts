import { NextResponse } from 'next/server';
import { milvusClient, COLLECTIONS } from '@/utils/milvusClient';

export async function GET() {
  try {
    console.log('Testing Milvus connection...');

    // Test listing collections
    const collections = await milvusClient.listCollections();
    console.log('Milvus Collections:', collections);

    // Check if the "tasks_collection" exists
    const tasksCollectionExists = collections.collection_names.includes(COLLECTIONS.TASKS);

    if (!tasksCollectionExists) {
      console.log('Creating tasks_collection...');
      await milvusClient.createCollection({
        collection_name: COLLECTIONS.TASKS,
        fields: [
          { name: 'id', data_type: 'VarChar', is_primary_key: true },
          { name: 'name', data_type: 'VarChar' },
          { name: 'description', data_type: 'VarChar' },
          { name: 'due_date', data_type: 'VarChar' },
          { name: 'project_id', data_type: 'VarChar' },
          { name: 'assignee_id', data_type: 'VarChar' },
          { name: 'priority', data_type: 'VarChar' },
          { name: 'priority_reasons', data_type: 'VarChar' },
          { name: 'project', data_type: 'VarChar' },
          { name: 'embedding', data_type: 'FloatVector', dim: 1536 },
        ],
      });
      console.log('tasks_collection created successfully');
    }

    // Query data from tasks_collection
    const tasks = await milvusClient.query({
      collection_name: COLLECTIONS.TASKS,
      output_fields: ['id', 'name', 'description', 'due_date', 'project_id', 'assignee_id', 'priority', 'priority_reasons', 'project'],
    });
    console.log('Fetched Tasks:', tasks);

    return NextResponse.json({
      message: 'Milvus connection successful',
      collections,
      tasks: tasks.data,
    });
  } catch (error) {
    console.error('Error connecting to Milvus:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Milvus' },
      { status: 500 }
    );
  }
}