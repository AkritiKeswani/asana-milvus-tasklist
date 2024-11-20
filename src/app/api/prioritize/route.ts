import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/utils/openAI";
import { milvus, searchMilvus } from "@/utils/milvusClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json(
        { error: "Invalid input: userInput is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("Received userInput:", userInput);

    // Check if data is available in Milvus
    const collectionInfo = await milvus.getCollectionStats("asana_tasks");
    const numEntities = collectionInfo.data.row_count;

    if (numEntities === 0) {
      console.log("No data in Milvus collection. Awaiting Airbyte sync.");
      return NextResponse.json(
        { error: "Data not yet synced. Please try again later." },
        { status: 200 }
      );
    }

    // Generate embedding from user input
    const embedding = await generateEmbedding(userInput);
    console.log("Generated embedding:", embedding);

    // Query Milvus for similar tasks
    const tasks = await searchMilvus(embedding, `status == "open"`);
    console.log("Retrieved tasks from Milvus:", tasks);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Error in prioritize API route:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
