import { milvusClient } from '../utils/milvusClient';

const testMetadataCollection = async () => {
  try {
    console.log('Testing tasks_metadata collection...');

    // 1. Verify collection exists
    const exists = await milvusClient.hasCollection({
      collection_name: 'tasks_metadata'
    });
    console.log('Collection exists:', exists);

    // 2. Insert test data
    const testTask = {
      milvus_id: 454083262675467582, // Use one of the IDs from your Airbyte_Zilliz collection
      asana_id: 'test_asana_123',
      name: 'Test Task',
      description: 'This is a test task description',
      status: 'active',
      due_date: new Date().toISOString(),
      priority: 1
    };

    console.log('\nInserting test task:', testTask);
    const insertResponse = await milvusClient.insert({
      collection_name: 'tasks_metadata',
      fields_data: [testTask]
    });
    console.log('Insert response:', insertResponse);

    // 3. Query the inserted data
    console.log('\nQuerying inserted data...');
    const queryResponse = await milvusClient.query({
      collection_name: 'tasks_metadata',
      expr: `milvus_id == ${testTask.milvus_id}`,
      output_fields: ['asana_id', 'name', 'description', 'status', 'due_date', 'priority']
    });
    console.log('Query response:', queryResponse);

  } catch (error) {
    console.error('Error testing metadata collection:', error);
  }
};

testMetadataCollection();