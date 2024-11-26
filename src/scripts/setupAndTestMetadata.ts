import { milvusClient } from '../utils/milvusClient';
import { DataType } from '@zilliz/milvus2-sdk-node';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const setupAndTestMetadata = async () => {
  const COLLECTION_NAME = 'tasks_metadata';
  
  try {
    console.log('1. Checking if collection exists...');
    const exists = await milvusClient.hasCollection({
      collection_name: COLLECTION_NAME
    });

    if (exists.value) {
      console.log('Dropping existing collection...');
      await milvusClient.dropCollection({
        collection_name: COLLECTION_NAME
      });
      console.log('Existing collection dropped');
      await wait(2000);
    }

    console.log('2. Creating tasks_metadata collection...');
    await milvusClient.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        {
          name: 'milvus_id',
          description: 'ID from Airbyte_Zilliz collection',
          data_type: DataType.Int64,
          is_primary_key: true,
          auto_id: false
        },
        {
          name: 'dummy_vector',
          description: 'Dummy vector field required by Milvus',
          data_type: DataType.FloatVector,
          dim: 2
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
    
    console.log('Collection created, waiting before creating index...');
    await wait(2000);
      
    console.log('Creating index...');
    await milvusClient.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'dummy_vector',
      extra_params: {
        index_type: 'FLAT',
        metric_type: 'L2'
      }
    });
    
    console.log('Index created, waiting before loading...');
    await wait(2000);

    console.log('3. Loading collection...');
    await milvusClient.loadCollection({
      collection_name: COLLECTION_NAME
    });

    console.log('Collection loaded successfully');
    await wait(1000);

    // Insert test data
    console.log('4. Inserting test data...');
    const testTask = {
      milvus_id: 454083262675467582,
      dummy_vector: [0.0, 0.0],
      asana_id: 'test_asana_123',
      name: 'Test Task',
      description: 'This is a test task description',
      status: 'active',
      due_date: new Date().toISOString(),
      priority: 1
    };

    const insertResponse = await milvusClient.insert({
      collection_name: COLLECTION_NAME,
      fields_data: [testTask]
    });
    
    console.log('Insert response:', insertResponse);
    console.log('Inserted ID:', insertResponse.IDs.int_id.data[0]);

    await wait(1000);

    console.log('\n5. Verifying inserted data...');
    
    // Check all records with limit
    console.log('Checking all records...');
    const allRecords = await milvusClient.query({
      collection_name: COLLECTION_NAME,
      output_fields: ['milvus_id', 'asana_id', 'name', 'description', 'status', 'due_date', 'priority'],
      expr: '',
      limit: 100  // Added limit parameter
    });
    console.log('All records:', JSON.stringify(allRecords, null, 2));

    // Query specific record
    const actualInsertedId = insertResponse.IDs.int_id.data[0];
    console.log('\nQuerying for specific record with ID:', actualInsertedId);
    const queryResponse = await milvusClient.query({
      collection_name: COLLECTION_NAME,
      expr: `milvus_id == ${actualInsertedId}`,
      output_fields: ['milvus_id', 'asana_id', 'name', 'description', 'status', 'due_date', 'priority']
    });
    console.log('Specific query response:', JSON.stringify(queryResponse, null, 2));

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
};

setupAndTestMetadata();