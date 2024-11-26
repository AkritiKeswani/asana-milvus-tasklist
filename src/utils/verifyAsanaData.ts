import { milvusClient, COLLECTIONS } from './milvusClient';

async function verifyCollection(collectionName: string) {
  try {
    const hasCollection = await milvusClient.hasCollection({
      collection_name: collectionName,
    });

    if (!hasCollection) {
      console.log(`Collection ${collectionName} does not exist.`);
      return;
    }

    const stats = await milvusClient.getCollectionStatistics({
      collection_name: collectionName,
    });

    console.log(`Collection ${collectionName}:`);
    console.log(`- Row count: ${stats.row_count}`);

    // Get the first row to verify data
    const queryResult = await milvusClient.query({
      collection_name: collectionName,
      limit: 1,
    });

    if (queryResult.data.length > 0) {
      console.log('- Sample data:', JSON.stringify(queryResult.data[0], null, 2));
    } else {
      console.log('- No data found in the collection.');
    }

    console.log('---');
  } catch (error) {
    console.error(`Error verifying collection ${collectionName}:`, error);
  }
}

export async function verifyAsanaData() {
  console.log('Verifying Asana data in Milvus...');

  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    await verifyCollection(collectionName);
  }

  console.log('Verification complete.');
}

