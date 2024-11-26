import { taskVectorStore } from '@/utils/taskVectorStore';

async function testPrioritize() {
  try {
    // Test the collection exists
    const exists = await taskVectorStore.collectionExists();
    console.log('Collection exists:', exists);

    if (!exists) {
      console.log('Creating collection...');
      await taskVectorStore.createCollection();
    }

    // Test prioritization
    const tasks = await taskVectorStore.getPrioritizedTasks(
      'What should I work on next?',
      'test-user'
    );

    console.log('Prioritized tasks:', tasks);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPrioritize();