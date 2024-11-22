import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Explicitly load `.env.local`

import { milvusClient } from '../src/utils/milvusClient';

// Debug log environment variables
console.log('MILVUS_ADDRESS (from test-connection.ts):', process.env.MILVUS_ADDRESS);
console.log('ZILLIZ_CLOUD_TOKEN (from test-connection.ts):', process.env.ZILLIZ_CLOUD_TOKEN);

async function testConnection() {
  try {
    console.log('Testing connection to Milvus Cloud...');
    const collections = await milvusClient.listCollections();
    console.log('Connection successful!');
    console.log('Collections:', collections);
  } catch (error) {
    console.error('Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
