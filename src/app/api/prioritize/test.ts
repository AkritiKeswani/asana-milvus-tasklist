import { taskVectorStore } from '@/utils/taskVectorStore';
import type { PrioritizedTask } from '@/utils/types/taskTypes'; // Assuming you have this type

async function testPrioritize(): Promise<void> {
  try {
    console.log('Starting prioritization test...');
    
    // Test the collection exists
    const exists = await taskVectorStore.collectionExists();
    console.log('Collection exists:', exists);

    if (!exists) {
      console.log('Creating collection...');
      await taskVectorStore.createCollection();
      console.log('Collection created successfully');
    }

    // Test prioritization
    const tasks: PrioritizedTask[] = await taskVectorStore.getPrioritizedTasks(
      'What should I work on next?',
      'test-user'
    );

    if (tasks.length === 0) {
      console.log('No tasks found to prioritize');
      return;
    }

    console.log('Successfully prioritized tasks:');
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.name || task.id}`);
    });
  } catch (error) {
    console.error('Test failed:', error instanceof Error ? error.message : 'Unknown error occurred');
    throw error; // Re-throw to maintain error propagation
  }
}

// Execute the test
testPrioritize()
  .then(() => console.log('Test completed successfully'))
  .catch((error) => {
    console.error('Test failed with error:', error);
    process.exit(1); // Exit with error code if running as script
  });