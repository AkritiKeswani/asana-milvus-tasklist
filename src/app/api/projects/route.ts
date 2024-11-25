import { NextResponse } from 'next/server';
import { milvusClient, COLLECTIONS } from '@/utils/milvusClient';

export async function GET() {
  try {
    console.log("Fetching projects collection...");

    // Check available collections
    const collections = await milvusClient.listCollections();
    console.log("Available collections:", collections);

    const projects = await milvusClient.query({
      collection_name: COLLECTIONS.PROJECTS,
      output_fields: ['id', 'name', 'description'],
    });

    console.log("Fetched projects:", projects);

    return NextResponse.json({ projects: projects.data });
  } catch (error) {
    console.error("Error in projects route:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}



