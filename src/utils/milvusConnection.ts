import { milvusClient, COLLECTIONS } from './milvusClient';

// Define the helper function first
const ensureCollection = async (collectionName: string): Promise<boolean> => {
  try {
    const exists = await milvusClient.hasCollection({
      collection_name: collectionName
    });
    return !!exists.value;
  } catch (error) {
    console.error('Error checking collection:', collectionName, error);
    return false;
  }
};

export async function testMilvusConnection() {
  try {
    // Test basic connection
    const serverVersion = await milvusClient.getVersion();
    console.log('Connected to Milvus server version:', serverVersion);

    // List collections
    const collections = await milvusClient.listCollections();
    console.log('Available collections:', collections);

    // Test each configured collection
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      const exists = await ensureCollection(collectionName);
      console.log(`Collection ${key} (${collectionName}): ${exists ? 'exists' : 'not found'}`);
      
      if (exists) {
        const stats = await milvusClient.getCollectionStatistics({
          collection_name: collectionName,
        });
        console.log(`${key} collection statistics:`, stats);
      }
    }

    return { success: true, collections };
  } catch (error) {
    console.error('Milvus connection test failed:', error);
    return { success: false, error };
  }
}