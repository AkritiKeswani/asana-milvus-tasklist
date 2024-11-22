// src/app/api/test-milvus/route.ts
import { NextResponse } from 'next/server';
import { milvusClient } from '@/utils/milvusClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('API route accessed');
  
  try {
    console.log('Testing Milvus connection...');
    const collections = await milvusClient.listCollections();
    console.log('Milvus collections:', collections);
    return NextResponse.json({ 
      status: 'success',
      collections 
    });
  } catch (error) {
    console.error('Milvus Error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: String(error) 
    }, { 
      status: 500 
    });
  }
}