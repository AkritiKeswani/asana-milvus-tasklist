import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function testConnection() {
  try {
    // Initialize Milvus client
    const client = new MilvusClient({
      address: process.env.MILVUS_URI,
      token: process.env.ZILLIZ_TOKEN,
      ssl: true
    });

    // Test connection
    console.log('Testing connection to Milvus...');
    const version = await client.getVersion();
    console.log('Connected to Milvus version:', version);

    // List collections
    const collections = await client.listCollections();
    console.log('Available collections:', collections);

    return { success: true, collections };
  } catch (error) {
    console.error('Error connecting to Milvus:', error);
    return { success: false, error };
  }
}

// Run the test
async function main() {
  try {
    const result = await testConnection();
    if (result.success) {
      console.log('✅ Connection test successful');
    } else {
      console.error('❌ Connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();