import { DataType, type SearchResultData } from "@zilliz/milvus2-sdk-node"
import { milvusClient, COLLECTIONS } from "./milvusClient"
import { openAIEmbeddings } from "./openAI"
import type { TaskVector, PrioritizedTask } from "../types/taskTypes"

export interface TaskVector {
  id: string
  name: string
  description: string
  embedding: number[]
  workspace: string
  userId: string
  project_id?: string
  due_date?: string
  status: string
  priority?: number
  assignee?: string
  created_at: string
  modified_at: string
}

export interface PrioritizedTask extends Omit<TaskVector, "embedding"> {
  priorityScore: number
  priorityReasons: string[]
}

class TaskVectorStore {
  private readonly collectionName = COLLECTIONS.TASKS
  private static instance: TaskVectorStore

  private constructor() {}

  public static getInstance(): TaskVectorStore {
    if (!TaskVectorStore.instance) {
      TaskVectorStore.instance = new TaskVectorStore()
    }
    return TaskVectorStore.instance
  }

  async collectionExists(): Promise<boolean> {
    try {
      const exists = await milvusClient.hasCollection({
        collection_name: this.collectionName,
      })
      return !!exists.value
    } catch (error) {
      console.error("Error checking collection existence:", error)
      throw error
    }
  }

  async getCollectionStats() {
    try {
      const stats = await milvusClient.getCollectionStatistics({
        collection_name: this.collectionName,
      })
      return stats
    } catch (error) {
      console.error("Error getting collection statistics:", error)
      throw error
    }
  }

  async createCollection(): Promise<boolean> {
    try {
      const exists = await this.collectionExists()

      if (!exists) {
        console.log("Creating collection:", this.collectionName)
        await milvusClient.createCollection({
          collection_name: this.collectionName,
          fields: [
            {
              name: "id",
              description: "Task ID",
              data_type: DataType.VarChar,
              max_length: 100,
              is_primary_key: true,
              autoID: false,
            },
            {
              name: "name",
              description: "Task name",
              data_type: DataType.VarChar,
              max_length: 500,
            },
            {
              name: "description",
              description: "Task description",
              data_type: DataType.VarChar,
              max_length: 10000,
            },
            {
              name: "embedding",
              description: "Task embedding vector",
              data_type: DataType.FloatVector,
              dim: 1536,
            },
            {
              name: "workspace",
              description: "Workspace identifier",
              data_type: DataType.VarChar,
              max_length: 100,
            },
            {
              name: "userId",
              description: "User identifier",
              data_type: DataType.VarChar,
              max_length: 100,
            },
            {
              name: "project_id",
              description: "Project identifier",
              data_type: DataType.VarChar,
              max_length: 100,
            },
            {
              name: "status",
              description: "Task status",
              data_type: DataType.VarChar,
              max_length: 50,
            },
            {
              name: "due_date",
              description: "Due date",
              data_type: DataType.VarChar,
              max_length: 30,
            },
            {
              name: "priority",
              description: "Priority level",
              data_type: DataType.Int16,
            },
            {
              name: "assignee",
              description: "Task assignee",
              data_type: DataType.VarChar,
              max_length: 100,
            },
            {
              name: "created_at",
              description: "Creation timestamp",
              data_type: DataType.VarChar,
              max_length: 30,
            },
            {
              name: "modified_at",
              description: "Last modification timestamp",
              data_type: DataType.VarChar,
              max_length: 30,
            },
          ],
        })

        await milvusClient.createIndex({
          collection_name: this.collectionName,
          field_name: "embedding",
          extra_params: {
            index_type: "IVF_FLAT",
            metric_type: "L2",
            params: JSON.stringify({ nlist: 1024 }),
          },
        })

        await milvusClient.loadCollection({
          collection_name: this.collectionName,
        })

        console.log("Collection created successfully")
      }

      return true
    } catch (error) {
      console.error("Error creating collection:", error)
      throw error
    }
  }

  async insertTask(task: TaskVector) {
    try {
      const response = await milvusClient.insert({
        collection_name: this.collectionName,
        fields_data: [
          {
            id: task.id,
            name: task.name,
            description: task.description,
            embedding: task.embedding,
            workspace: task.workspace,
            userId: task.userId,
            project_id: task.project_id || "",
            status: task.status,
            due_date: task.due_date || "",
            priority: task.priority || 0,
            assignee: task.assignee || "",
            created_at: task.created_at,
            modified_at: task.modified_at,
          },
        ],
      })

      return response
    } catch (error) {
      console.error("Error inserting task:", error)
      throw error
    }
  }

  async searchSimilarTasks(embedding: number[], limit = 5): Promise<SearchResultData[]> {
    try {
      const searchResponse = await milvusClient.search({
        collection_name: this.collectionName,
        vector: embedding,
        limit,
        output_fields: [
          "id",
          "name",
          "description",
          "status",
          "due_date",
          "priority",
          "assignee",
          "created_at",
          "modified_at",
        ],
      })

      return searchResponse.results
    } catch (error) {
      console.error("Error searching similar tasks:", error)
      throw error
    }
  }

  async getPrioritizedTasks(query: string): Promise<PrioritizedTask[]> {
    try {
      const queryEmbedding = await openAIEmbeddings.embedQuery(query)
      const searchResults = await this.searchSimilarTasks(queryEmbedding, 10)

      const tasks = await Promise.all(
        searchResults.map(async (result: SearchResultData) => {
          const priorityPrompt = `
            Given the user query "${query}", analyze the following task and provide 2-3 brief reasons for its priority level:
            Task: ${result.name}
            Description: ${result.description}
            Status: ${result.status}
            Due Date: ${result.due_date || "No due date"}
            
            Format your response as a JSON array of strings, each containing a reason.
          `

          const reasonsResponse = await openAIEmbeddings.generateResponse(priorityPrompt)
          let priorityReasons: string[]
          try {
            priorityReasons = JSON.parse(reasonsResponse)
          } catch {
            priorityReasons = ["Relevance to query", "Task importance"]
          }

          return {
            id: result.id as string,
            name: result.name as string,
            description: result.description as string,
            status: result.status as string,
            workspace: result.workspace as string,
            userId: result.userId as string,
            project_id: result.project_id as string,
            due_date: result.due_date as string,
            priority: result.priority as number,
            assignee: result.assignee as string,
            created_at: result.created_at as string,
            modified_at: result.modified_at as string,
            priorityScore: result.score,
            priorityReasons,
          }
        }),
      )

      return tasks.sort((a, b) => b.priorityScore - a.priorityScore)
    } catch (error) {
      console.error("Error getting prioritized tasks:", error)
      throw error
    }
  }
}

export const taskVectorStore = TaskVectorStore.getInstance()

