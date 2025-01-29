import { NextResponse } from "next/server"
import path from "path"
import OpenAI from "openai"
import type { SearchResult } from "@/types/asana"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  console.log("Route hit!")
  try {
    const body = await req.json()
    const text = body.text || body.query || body.input

    if (!text) {
      throw new Error("No search text provided")
    }

    console.log("Received text query:", text)

    // Get embedding from OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.trim(),
      encoding_format: "float",
    })

    const vector = embedding.data[0].embedding
    console.log("Generated vector of length:", vector.length)

    // Initialize Milvus client
    const { MilvusClient } = await import("@zilliz/milvus2-sdk-node/dist/milvus/MilvusClient")

    const protoPath = path.join(process.cwd(), ".next/proto/proto")
    console.log("Proto path:", protoPath)

    if (!process.env.MILVUS_URI || !process.env.ZILLIZ_TOKEN) {
      throw new Error("Missing required environment variables: MILVUS_URI or ZILLIZ_TOKEN")
    }

    const client = new MilvusClient({
      address: process.env.MILVUS_URI,
      token: process.env.ZILLIZ_TOKEN,
      ssl: true,
      tls: {
        verifyOptions: {
          rejectUnauthorized: false,
        },
      },
    })

    // Search Milvus with the embedding vector
    const searchResults = await client.search({
      collection_name: "Airbyte_Zilliz",
      vector: vector,
      limit: 5,
      output_fields: [
        "id",
        "name",
        "description",
        "due_date",
        "tags",
        "project_id",
        "assignee_id",
        "custom_fields",
        "completed",
        "modified_at",
      ],
      metric_type: "COSINE",
      params: {
        nprobe: 10,
        offset: 0,
      },
      expr: "completed == false",
    })

    console.log("Search results:", searchResults)

    // Get only the most relevant task with high similarity
    const tasks = searchResults.results
      .map((result): SearchResult & { normalizedScore: number } => ({
        ...(result as unknown as SearchResult),
        normalizedScore: (result.score + 1) / 2, // Convert from [-1,1] to [0,1]
      }))
      .filter((result) => result.normalizedScore > 0.85)
      .map((result) => ({
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
      .sort((a, b) => Number.parseFloat(b.similarityPercentage) - Number.parseFloat(a.similarityPercentage))
      .slice(0, 1)

    const summaryMessage =
      tasks.length > 0
        ? `Found the most relevant task (${tasks[0].similarityPercentage}% similarity) for: "${text}"`
        : `No highly relevant tasks found for: "${text}". Try different search terms.`

    return NextResponse.json({
      tasks,
      summary: summaryMessage,
    })
  } catch (error: unknown) {
    console.error("Detailed error:", error)
    return NextResponse.json(
      { error: "Failed to search tasks: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  )
}

