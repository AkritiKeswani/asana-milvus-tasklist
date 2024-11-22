import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { MilvusNode } from '@zilliz/milvus-sdk-node';

// Debug logs for environment variables
const milvusCloudAddress = process.env.MILVUS_ADDRESS;
const zillizCloudToken = process.env.ZILLIZ_CLOUD_TOKEN;

console.log('MILVUS_ADDRESS:', milvusCloudAddress);
console.log('ZILLIZ_CLOUD_TOKEN:', zillizCloudToken);

if (!milvusCloudAddress || !zillizCloudToken) {
  throw new Error('Missing MILVUS_ADDRESS or ZILLIZ_CLOUD_TOKEN in environment variables');
}

// Initialize and export MilvusNode client
export const milvusClient = new MilvusNode({
  address: milvusCloudAddress,
  token: zillizCloudToken,
});

// Define and export COLLECTIONS
export const COLLECTIONS = {
  TASKS: 'tasks_collection', // Example collection name
  USERS: 'users_collection', // Example collection name
};

// Example usage of COLLECTIONS (Debug Log)
console.log('Available Collections:', COLLECTIONS);
