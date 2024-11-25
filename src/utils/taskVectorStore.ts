import { MilvusClient, DataType, SearchResult } from '@zilliz/milvus2-sdk-node';
import { milvusClient, COLLECTIONS } from './milvusClient';
import { openAIEmbeddings } from './openAI';

export interface TaskVector {
  id: string;
  name: string;
  description: string;
  embedding: number[];
  workspace: string;
  userId: string;
  project_id?: string;
  due_date?: string;
  status: string;
  priority?: number;
  assignee?: string;
  created_at: string;
  modified_at: string;
}

export interface PrioritizedTask extends Omit<TaskVector, 'embedding'> {
  priorityScore: number;
  priorityReasons: string[];
}

class TaskVectorStore {
  private readonly collectionName = COLLECTIONS.TASKS;
  private static instance: TaskVectorStore;

  private constructor() {}

  public static getInstance(): TaskVectorStore {
    if (!TaskVectorStore.instance) {
      TaskVectorStore.instance = new TaskVectorStore();
    }
    return TaskVectorStore.instance;
  }

  // Check if collection exists
  async collectionExists(): Promise<boolean> {
    try {
      return await milvusClient.hasCollection({
        collection_name: this.collectionName
      });
    } catch (error) {
      console.error('Error checking collection existence:', error);
      throw error;
    }
  }

  // Get collection statistics
  async getCollectionStats() {
    try {
      const stats = await milvusClient.getCollectionStatistics({
        collection_name: this.collectionName
      });
      return stats;
    } catch (error) {
      console.error('Error getting collection statistics:', error);
      throw error;
    }
  }

  // Create collection if it doesn't exist
  async createCollection(): Promise<boolean> {
    try {
      const exists = await this.collectionExists();

      if (!exists) {
        console.log('Creating collection:', this.collectionName);
        await milvusClient.createCollection({
          collection_name: this.collectionName,
          fields: [
            {
              name: 'id',
              description: 'Task ID',
              data_type: DataType.VarChar,
              max_length: 100,
              is_primary_key: true,
              auto_id: false
            },
            {
              name: 'name',
              description: 'Task name',
              data_type: DataType.VarChar,
              max_length: 500
            },
            {
              name: 'description',
              description: 'Task description',
              data_type: DataType.VarChar,
              max_length: 10000
            },
            {
              name: 'embedding',
              description: 'Task embedding vector',
              data_type: DataType.FloatVector,
              dim: 1536
            },
            {
              name: 'workspace',
              description: 'Workspace identifier',
              data_type: DataType.VarChar,
              max_length: 100
            },
            {
              name: 'userId',
              description: 'User identifier',
              data_type: DataType.VarChar,
              max_length: 100
            },
            {
              name: 'project_id',
              description: 'Project identifier',
              data_type: DataType.VarChar,
              max_length: 100
            },
            {
              name: 'status',
              description: 'Task status',
              data_type: DataType.VarChar,
              max_length: 50
            },
            {
              name: 'due_date',
              description: 'Due date',
              data_type: DataType.VarChar,
              max_length: 30
            },
            {
              name: 'priority',
              description: 'Priority level',
              data_type: DataType.Int16
            },
            {
              name: 'assignee',
              description: 'Task assignee',
              data_type: DataType.VarChar,
              max_length: 100
            },
            {
              name: 'created_at',
              description: 'Creation timestamp',
              data_type: DataType.VarChar,
              max_length: 30
            },
            {
              name: 'modified_at',
              description: 'Last modification timestamp',
              data_type: DataType.VarChar,
              max_length: 30
            }
          ]
        });

        // Create index on embedding field
        await milvusClient.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          extra_params: {
            index_type: 'IVF_FLAT',
            metric_type: 'L2',
            params: { nlist: 1024 }
          }
        });

        // Load collection into memory
        await milvusClient.loadCollection({
          collection_name: this.collectionName
        });

        console.log('Collection created successfully');
      }

      return true;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  // Insert a single task
  async insertTask(task: TaskVector) {
    try {
      const response = await milvusClient.insert({
        collection_name: this.collectionName,
        fields_data: [{
          id: task.id,
          name: task.name,
          description: task.description,
          embedding: task.embedding,
          workspace: task.workspace,
          userId: task.userId,
          project_id: task.project_id || '',
          status: task.status,
          due_date: task.due_date || '',
          priority: task.priority || 0,
          assignee: task.assignee || '',
          created_at: task.created_at,
          modified_at: task.modified_at
        }]
      });

      return response;
    } catch (error) {
      console.error('Error inserting task:', error);
      throw error;
    }
  }

  // Search for similar tasks
  async searchSimilarTasks(embedding: number[], limit: number = 5): Promise<SearchResult[]> {
    try {
      const searchResponse = await milvusClient.search({
        collection_name: this.collectionName,
        vector: embedding,
        limit,
        output_fields: [
          'id',
          'name',
          'description',
          'status',
          'due_date',
          'priority',
          'assignee',
          'created_at',
          'modified_at'
        ]
      });

      return searchResponse.results;
    } catch (error) {
      console.error('Error searching similar tasks:', error);
      throw error;
    }
  }

  // Get prioritized tasks
  async getPrioritizedTasks(query: string, userId: string): Promise<PrioritizedTask[]> {
    try {
      // Create embedding for query
      const queryEmbedding = await openAIEmbeddings.embedQuery(query);

      // Search for similar tasks
      const searchResults = await this.searchSimilarTasks(queryEmbedding, 10);

      // Process and prioritize tasks
      const tasks = await Promise.all(
        searchResults.map(async (result: any) => {
          const priorityPrompt = `
            Given the user query "${query}", analyze the following task and provide 2-3 brief reasons for its priority level:
            Task: ${result.name}
            Description: ${result.description}
            Status: ${result.status}
            Due Date: ${result.due_date || 'No due date'}
            
            Format your response as a JSON array of strings, each containing a reason.
          `;

          const reasonsResponse = await openAIEmbeddings.generateResponse(priorityPrompt);
          let priorityReasons: string[];
          try {
            priorityReasons = JSON.parse(reasonsResponse);
          } catch (e) {
            priorityReasons = ['Relevance to query', 'Task importance'];
          }

          return {
            ...result,
            priorityScore: result.score,
            priorityReasons
          };
        })
      );

      return tasks.sort((a, b) => b.priorityScore - a.priorityScore);
    } catch (error) {
      console.error('Error getting prioritized tasks:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskVectorStore = TaskVectorStore.getInstance();