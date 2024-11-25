import { milvusClient, COLLECTIONS } from './milvusClient.js';
import type { SearchResult, InsertReq, DataType } from '@zilliz/milvus2-sdk-node';

export interface TaskVector {
  id: string;
  title: string;
  description: string;
  embedding: number[];
  workspace: string;
  project_id?: string;
  due_date?: string;
  status: string;
  priority?: number;
  tags?: string[];
  assignee?: string;
  created_at: string;
  modified_at: string;
}

export interface SearchParams {
  embedding: number[];
  limit?: number;
  workspace?: string;
  project_id?: string;
  status?: string;
}

export class TaskVectorStore {
  private readonly collectionName = COLLECTIONS.TASKS;

  // Create the tasks collection if it doesn't exist
  async createCollection() {
    try {
      const exists = await milvusClient.hasCollection({
        collection_name: this.collectionName
      });

      if (!exists) {
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
              name: 'title',
              description: 'Task title',
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
              dim: 1536 // OpenAI embedding dimension
            },
            {
              name: 'workspace',
              description: 'Workspace identifier',
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
              name: 'due_date',
              description: 'Task due date',
              data_type: DataType.VarChar,
              max_length: 30
            },
            {
              name: 'status',
              description: 'Task status',
              data_type: DataType.VarChar,
              max_length: 50
            },
            {
              name: 'priority',
              description: 'Task priority',
              data_type: DataType.Int16
            },
            {
              name: 'tags',
              description: 'Task tags',
              data_type: DataType.Array,
              element_type: DataType.VarChar,
              max_capacity: 10
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

        // Create index on the embedding field
        await milvusClient.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          index_type: 'IVF_FLAT',
          metric_type: 'L2',
          params: { nlist: 1024 }
        });

        console.log(`Collection ${this.collectionName} created successfully`);
      }

      return true;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  // Insert tasks into the collection
  async insertTasks(tasks: TaskVector[]) {
    try {
      const insertReq: InsertReq = {
        collection_name: this.collectionName,
        fields_data: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          embedding: task.embedding,
          workspace: task.workspace,
          project_id: task.project_id || '',
          due_date: task.due_date || '',
          status: task.status,
          priority: task.priority || 0,
          tags: task.tags || [],
          assignee: task.assignee || '',
          created_at: task.created_at,
          modified_at: task.modified_at
        }))
      };

      const insertResponse = await milvusClient.insert(insertReq);
      return insertResponse;
    } catch (error) {
      console.error('Error inserting tasks:', error);
      throw error;
    }
  }

  // Search for similar tasks
  async searchSimilarTasks({
    embedding,
    limit = 5,
    workspace,
    project_id,
    status
  }: SearchParams): Promise<SearchResult[]> {
    try {
      let expr = '';
      if (workspace) {
        expr += `workspace == "${workspace}"`;
      }
      if (project_id) {
        expr += expr ? ` && project_id == "${project_id}"` : `project_id == "${project_id}"`;
      }
      if (status) {
        expr += expr ? ` && status == "${status}"` : `status == "${status}"`;
      }

      const searchResponse = await milvusClient.search({
        collection_name: this.collectionName,
        vector: embedding,
        limit,
        output_fields: [
          'id',
          'title',
          'description',
          'workspace',
          'project_id',
          'due_date',
          'status',
          'priority',
          'tags',
          'assignee',
          'created_at',
          'modified_at'
        ],
        expr: expr || undefined
      });

      return searchResponse.results;
    } catch (error) {
      console.error('Error searching similar tasks:', error);
      throw error;
    }
  }

  // Delete tasks by IDs
  async deleteTasks(taskIds: string[]) {
    try {
      const expr = `id in [${taskIds.map(id => `"${id}"`).join(',')}]`;
      const deleteResponse = await milvusClient.delete({
        collection_name: this.collectionName,
        expr
      });
      return deleteResponse;
    } catch (error) {
      console.error('Error deleting tasks:', error);
      throw error;
    }
  }

  // Update task by ID
  async updateTask(taskId: string, updateData: Partial<TaskVector>) {
    try {
      const expr = `id == "${taskId}"`;
      
      // Remove undefined values and id from update data
      const cleanUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== undefined && key !== 'id') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(cleanUpdateData).length > 0) {
        await milvusClient.delete({
          collection_name: this.collectionName,
          expr
        });

        // Insert updated task
        await this.insertTasks([{
          id: taskId,
          ...cleanUpdateData
        } as TaskVector]);
      }

      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<TaskVector | null> {
    try {
      const expr = `id == "${taskId}"`;
      const response = await milvusClient.query({
        collection_name: this.collectionName,
        expr,
        output_fields: [
          'id',
          'title',
          'description',
          'embedding',
          'workspace',
          'project_id',
          'due_date',
          'status',
          'priority',
          'tags',
          'assignee',
          'created_at',
          'modified_at'
        ]
      });

      if (response.data.length === 0) {
        return null;
      }

      return response.data[0] as TaskVector;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }
}

export default TaskVectorStore;