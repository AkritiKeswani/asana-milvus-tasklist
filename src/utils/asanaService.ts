import { Client } from 'asana';
import { openAIEmbeddings } from './openAI';
import { taskVectorStore, TaskVector } from './taskVectorStore';
import { taskMetadataStore } from './taskMetadataStore';

export class AsanaService {
  private client: Client;
  private static instance: AsanaService;

  private constructor() {
    this.client = Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_user_task_lists,new_project_templates' },
      logAsanaChangeWarnings: false
    }).useAccessToken(process.env.ASANA_ACCESS_TOKEN!);
  }

  public static getInstance(): AsanaService {
    if (!AsanaService.instance) {
      AsanaService.instance = new AsanaService();
    }
    return AsanaService.instance;
  }

  async getWorkspaceGid(): Promise<string> {
    const workspaces = await this.client.workspaces.findAll();
    const workspace = workspaces.data[0];
    if (!workspace) throw new Error('No workspace found');
    return workspace.gid;
  }

  async syncTasksToVectorStore(userId: string): Promise<void> {
    try {
      console.log('Starting Asana task sync...');
      const workspaceGid = await this.getWorkspaceGid();

      // Get all incomplete tasks assigned to the user
      const tasks = await this.client.tasks.findAll({
        workspace: workspaceGid,
        assignee: 'me',
        completed_since: 'now',
        opt_fields: [
          'gid',
          'name',
          'notes',
          'due_on',
          'projects.name',
          'completed',
          'modified_at',
          'assignee',
          'custom_fields'
        ]
      });

      console.log(`Found ${tasks.data.length} tasks in Asana`);

      // Process each task
      for (const task of tasks.data) {
        // Generate embedding for task content
        const taskContent = `${task.name} ${task.notes || ''}`;
        const embedding = await openAIEmbeddings.embedQuery(taskContent);

        // Convert Asana task to TaskVector format
        const taskVector: TaskVector = {
          id: task.gid,
          name: task.name,
          description: task.notes || '',
          embedding: embedding,
          workspace: workspaceGid,
          userId: userId,
          project_id: task.projects?.[0]?.gid,
          due_date: task.due_on,
          status: task.completed ? 'completed' : 'active',
          priority: this.getPriorityFromCustomFields(task.custom_fields),
          assignee: task.assignee?.gid,
          created_at: new Date().toISOString(),
          modified_at: task.modified_at
        };

        // Insert into vector store
        const vectorInsertResponse = await taskVectorStore.insertTask(taskVector);
        
        // Store metadata separately
        await taskMetadataStore.insertMetadata({
          milvus_id: vectorInsertResponse.row_count, // Assuming this is the returned ID
          asana_id: task.gid,
          name: task.name,
          description: task.notes || '',
          status: task.completed ? 'completed' : 'active',
          due_date: task.due_on,
          priority: this.getPriorityFromCustomFields(task.custom_fields)
        });
      }

      console.log('Task sync completed successfully');
    } catch (error) {
      console.error('Error syncing tasks:', error);
      throw error;
    }
  }

  private getPriorityFromCustomFields(customFields: any[]): number {
    if (!customFields) return 0;
    
    // Look for priority field
    const priorityField = customFields.find(field => 
      field.name.toLowerCase().includes('priority')
    );
    
    if (!priorityField?.number_value) {
      // If no explicit priority, check for due date proximity
      return 0;
    }

    return priorityField.number_value;
  }

  // Add method to fetch task details
  async getTaskDetails(taskId: string) {
    try {
      const task = await this.client.tasks.findById(taskId);
      return task;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }
}

export const asanaService = AsanaService.getInstance();