// src/scripts/testInsertTask.ts
import { milvusClient } from '../utils/milvusClient';
import { openAIEmbeddings } from '../utils/openAI';

const testMilvusInsertion = async () => {
  try {
    // 1. First verify we can connect and see the collection
    console.log('Checking collection...');
    const collections = await milvusClient.listCollections();
    console.log('Available collections:', collections);

    // 2. Generate an embedding for test data
    console.log('\nGenerating embedding for test data...');
    const testText = "This is a test task with high priority for today";
    const embedding = await openAIEmbeddings.embedQuery(testText);
    console.log('Embedding generated, length:', embedding.length);

    // 3. Insert data into your existing collection
    console.log('\nInserting data...');
    const insertResponse = await milvusClient.insert({
      collection_name: 'Airbyte_Zilliz', // Using exact name from your screenshot
      fields_data: [{
        vector: embedding
      }]
    });
    console.log('Insert response:', insertResponse);

    // 4. Test search to verify insertion
    console.log('\nTesting search...');
    const searchResponse = await milvusClient.search({
      collection_name: 'Airbyte_Zilliz',
      vector: embedding,
      limit: 5,
      output_fields: ['id']
    });
    console.log('Search results:', searchResponse);

  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the test
console.log('Starting Milvus test...');
testMilvusInsertion();