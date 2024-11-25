import { NextResponse } from 'next/server';
import { milvusClient, COLLECTIONS } from '@/utils/milvusClient';

export async function GET() {
  try {
    console.log('Testing Milvus connection...');

    // Test listing collections
    const collections = await milvusClient.listCollections();
    console.log('Milvus Collections:', collections);

    // Check if the "tasks_collection" exists
    const tasksCollectionExists = collections.some(
      (collection) => collection.name === COLLECTIONS.TASKS
    );

    if (!tasksCollectionExists) {
      console.log('Creating tasks_collection...');
      await milvusClient.createCollection({
        collection_name: COLLECTIONS.TASKS,
        fields: [
          { name: 'id', data_type: 'VARCHAR', is_primary_key: true },
          { name: 'name', data_type: 'VARCHAR' },
          { name: 'description', data_type: 'VARCHAR' },
          { name: 'embedding', data_type: 'FLOAT_VECTOR', dim: 1536 },
        ],
      });
      console.log('tasks_collection created successfully');
    }

    // Query data from tasks_collection
    const tasks = await milvusClient.query({
      collection_name: COLLECTIONS.TASKS,
      output_fields: ['id', 'name', 'description'], // Specify fields to return
    });
    console.log('Fetched Tasks:', tasks);

    return NextResponse.json({
      message: 'Milvus connection successful',
      collections,
      tasks: tasks.data, // Include task data in the response
    });
  } catch (error) {
    console.error('Error connecting to Milvus:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Milvus' },
      { status: 500 }
    );
  }
}