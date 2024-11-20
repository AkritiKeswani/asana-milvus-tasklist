import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import type { SearchResults } from "@zilliz/milvus2-sdk-node";

const MILVUS_URL = process.env.MILVUS_URL!;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN!;
const COLLECTION_NAME = "Airbyte_Zilliz";

const milvusClient = new MilvusClient({
    address: process.env.MILVUS_ADDRESS!,
    username: process.env.MILVUS_USERNAME!,
    password: process.env.MILVUS_PASSWORD!,
    ssl: true
  });
  
  const COLLECTION_NAME = "Airbyte_Zilliz";
  

export interface Task {
  id: string;
  task_title: string;
  task_description: string;
  priority: string;
}

export const searchMilvus = async (
  embedding: number[],
  filter: string
): Promise<Task[]> => {
  try {
    const response: SearchResult = await milvus.search({
      collection_name: COLLECTION_NAME,
      vectors: [embedding],
      search_params: {
        anns_field: "vector",
        metric_type: "L2",
        topk: 5,
      },
      expr: filter,
      output_fields: ["id", "task_title", "task_description", "priority"],
    });

    // Map the search result to a defined Task type
    const tasks: Task[] = response.results.map((result) => ({
      id: result.entity.id,
      task_title: result.entity.task_title,
      task_description: result.entity.task_description,
      priority: result.entity.priority,
    }));

    return tasks;
  } catch (error) {
    console.error("Milvus search error:", error);
    throw new Error("Failed to search Milvus");
  }
};
