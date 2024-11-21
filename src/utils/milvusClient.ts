import { MilvusClient } from '@zilliz/milvus2-client-node';

if (!process.env.MILVUS_HOST || !process.env.MILVUS_PORT) {
  throw new Error('Milvus configuration missing in environment variables');
}

export const milvusClient = new MilvusClient({
  address: `${process.env.MILVUS_HOST}:${process.env.MILVUS_PORT}`,
  username: process.env.MILVUS_USERNAME,
  password: process.env.MILVUS_PASSWORD,
});

export const COLLECTIONS = {
  TASKS: 'asana_tasks',
  PROJECTS: 'asana_projects',
  TAGS: 'asana_tags',
  CUSTOM_FIELDS: 'asana_custom_fields',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];