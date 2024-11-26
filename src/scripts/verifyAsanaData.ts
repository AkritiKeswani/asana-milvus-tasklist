// src/scripts/verifyAsanaData.ts
import { milvusClient } from '../utils/milvusClient';

const verifyAsanaStreams = async () => {
  try {
    console.log('Verifying Asana data streams in Milvus...');

    // 1. List all collections to find Asana-related ones
    const collections = await milvusClient.listCollections();
    console.log('\nAvailable collections:', collections.collection_names);

    // 2. For the Airbyte_Zilliz collection, get field info
    const collectionInfo = await milvusClient.describeCollection({
      collection_name: 'Airbyte_Zilliz'
    });
    console.log('\nCollection schema:', collectionInfo.schema);

    // 3. Get some sample data to verify content
    console.log('\nFetching sample records...');
    const queryResult = await milvusClient.query({
      collection_name: 'Airbyte_Zilliz',
      output_fields: ['id', 'vector'], // Add other fields if they exist
      limit: 5
    });
    console.log('\nSample records:', queryResult);

    // 4. Get collection statistics
    const stats = await milvusClient.getCollectionStatistics({
      collection_name: 'Airbyte_Zilliz'
    });
    console.log('\nCollection statistics:', stats);

  } catch (error) {
    console.error('Error during verification:', error);
  }
};

verifyAsanaStreams();