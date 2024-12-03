import { NextResponse } from 'next/server';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  console.log('Route hit!');
  try {
    const body = await request.json();
    const text = body.text || body.query || body.input;
    
    if (!text) {
      throw new Error('No search text provided');
    }
    
    console.log('Received text query:', text);

    // Get embedding from OpenAI using text-embedding-ada-002
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.trim(),
      encoding_format: "float"
    });
    
    const vector = embedding.data[0].embedding;
    console.log('Generated vector of length:', vector.length);

    // Initialize Milvus client
    const { MilvusClient } = await import('@zilliz/milvus2-sdk-node/dist/milvus/MilvusClient');
    
    const protoPath = path.join(process.cwd(), '.next/proto/proto');
    console.log('Proto path:', protoPath);
    
    const client = new MilvusClient({
      address: process.env.MILVUS_URI,
      token: process.env.ZILLIZ_TOKEN,
      ssl: true,
      tls: {
        rejectUnauthorized: false
      },
      protoPath
    });

    // Search Milvus with the embedding vector
    const searchResults = await client.search({
      collection_name: 'Airbyte_Zilliz',
      vector: vector,
      limit: 5, // Reduced limit since we only need the top result
      output_fields: ['id', 'name', 'description', 'due_date', 'tags', 'project_id', 
                     'assignee_id', 'custom_fields', 'completed', 'modified_at'],
      metric_type: 'COSINE',
      params: { 
        nprobe: 10,
        offset: 0
      },
      expr: "completed == false"
    });

    console.log('Search results:', searchResults);

    // Get only the most relevant task with high similarity
    const tasks = searchResults.results
      .map(result => ({
        ...result,
        normalizedScore: (result.score + 1) / 2, // Convert from [-1,1] to [0,1]
      }))
      .filter(result => result.normalizedScore > 0.85) // Increased threshold for higher relevance
      .map(result => ({
        id: result.id,
        name: result.name,
        description: result.description,
        due_date: result.due_date,
        tags: result.tags,
        project_id: result.project_id,
        assignee_id: result.assignee_id,
        custom_fields: result.custom_fields,
        completed: result.completed,
        modified_at: result.modified_at,
        priorityScore: result.score,
        similarityPercentage: (result.normalizedScore * 100).toFixed(1),
        priorityReasons: [
          `${(result.normalizedScore * 100).toFixed(1)}% relevant`,
          result.due_date ? `Due: ${new Date(result.due_date).toLocaleDateString()}` : null,
        ].filter(Boolean),
      }))
      .sort((a, b) => parseFloat(b.similarityPercentage) - parseFloat(a.similarityPercentage))
      .slice(0, 1); // Only take the single most relevant task

    const summaryMessage = tasks.length > 0
      ? `Found the most relevant task (${tasks[0].similarityPercentage}% similarity) for: "${text}"`
      : `No highly relevant tasks found for: "${text}". Try different search terms.`;

    return NextResponse.json({
      tasks,
      summary: summaryMessage,
    });

  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to search tasks: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}