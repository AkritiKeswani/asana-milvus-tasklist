// src/scripts/createMetadataCollection.ts
import { milvusClient } from '../utils/milvusClient';
import { DataType } from '@zilliz/milvus2-sdk-node';

const createMetadataCollection = async () => {
  try {
    const collectionName = 'tasks_metadata';
    
    // Check if collection already exists
    const exists = await milvusClient.hasCollection({
      collection_name: collectionName
    });

    if (exists) {
      console.log('Metadata collection already exists');
      return;
    }

    // Create collection
    await milvusClient.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: 'milvus_id',
          description: 'ID from Airbyte_Zilliz collection',
          data_type: DataType.Int64,
          is_primary_key: true,
          auto_id: false
        },
        {
          name: 'asana_id',
          description: 'Original Asana task ID',
          data_type: DataType.VarChar,
          max_length: 100
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
        }
      ]
    });

    console.log('Metadata collection created successfully');

  } catch (error) {
    console.error('Error creating metadata collection:', error);
  }
};

createMetadataCollection();