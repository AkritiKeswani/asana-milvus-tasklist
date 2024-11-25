import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

// Constants for collection names
export const COLLECTIONS = {
  TASKS: 'tasks_collection',
  USERS: 'users_collection',
} as const;

// Type for collection names
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// Environment variable validation
const milvusUri = process.env.MILVUS_URI;
const zillizToken = process.env.ZILLIZ_TOKEN;

if (!milvusUri || !zillizToken) {
  throw new Error(
    'Missing required environment variables: MILVUS_URI or ZILLIZ_TOKEN'
  );
}

// Initialize and export Milvus client
export const milvusClient = new MilvusClient({
  address: milvusUri,
  token: zillizToken,
  ssl: true
});

// Utility function to check collection existence
export async function ensureCollection(collectionName: CollectionName): Promise<boolean> {
  try {
    const collections = await milvusClient.listCollections();
    return collections.includes(collectionName);
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    throw error;
  }
}