import { taskVectorStore } from '../src/utils/taskVectorStore';
import { openAIEmbeddings } from '../src/utils/openAI';

async function testMilvusData() {
  try {
    console.log('1. Checking if collection exists...');
    const exists = await taskVectorStore.collectionExists();
    console.log('Collection exists:', exists);

    if (!exists) {
      console.log('Creating collection...');
      await taskVectorStore.createCollection();
      console.log('Collection created successfully');
    }

    console.log('\n2. Getting collection statistics...');
    const stats = await taskVectorStore.getCollectionStats();
    console.log('Collection stats:', stats);

    // Test inserting a sample task if needed
    const sampleTask = {
      id: 'test-task-1',
      name: 'Sample Priority Task',
      description: 'This is a test task for prioritization',
      embedding: await openAIEmbeddings.embedText('Sample Priority Task This is a test task for prioritization'),
      workspace: 'test-workspace',
      userId: 'test-user',
      status: 'not completed',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString()
    };

    console.log('\n3. Testing task insertion...');
    await taskVectorStore.insertTask(sampleTask);
    console.log('Sample task inserted');

    console.log('\n4. Testing task retrieval...');
    const tasks = await taskVectorStore.searchSimilarTasks(sampleTask.embedding);
    console.log(`Found ${tasks.length} similar tasks:`, tasks);

    console.log('\n5. Testing prioritization...');
    const prioritizedTasks = await taskVectorStore.getPrioritizedTasks(
      'Show me high priority tasks',
      'test-user'
    );
    console.log('Prioritized tasks:', prioritizedTasks);

  } catch (error) {
    console.error('Error during test:', error);
  }
}

testMilvusData();