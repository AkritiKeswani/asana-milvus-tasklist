// src/utils/taskMetadataStore.ts
import { milvusClient } from './milvusClient';

interface TaskMetadata {
  milvus_id: number;
  asana_id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  priority?: number;
}

export const taskMetadataStore = {
  async insertMetadata(metadata: TaskMetadata) {
    try {
      const response = await milvusClient.insert({
        collection_name: 'tasks_metadata',
        fields_data: [metadata]
      });
      return response;
    } catch (error) {
      console.error('Error inserting task metadata:', error);
      throw error;
    }
  },

  async getMetadataByMilvusId(milvusId: number) {
    try {
      const response = await milvusClient.query({
        collection_name: 'tasks_metadata',
        expr: `milvus_id == ${milvusId}`,
        output_fields: ['asana_id', 'name', 'description', 'status', 'due_date', 'priority']
      });
      return response.data[0];
    } catch (error) {
      console.error('Error getting task metadata:', error);
      throw error;
    }
  }
};