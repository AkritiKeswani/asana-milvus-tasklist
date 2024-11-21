import { milvusClient, COLLECTIONS } from './milvusClient';
import { openAIEmbeddings } from './openAI';
import type { AsanaTask, TaskWithEmbedding, SearchFilters, PrioritizedTask } from '../types/asana';
import { DataType } from '@zilliz/milvus2-client-node';

export class TaskVectorStore {
  private milvusClient;
  private embeddings;

  constructor() {
    this.milvusClient = milvusClient;
    this.embeddings = openAIEmbeddings;
  }

  async initialize() {
    await this.createCollections();
    await this.createIndexes();
  }

  private async createCollections() {
    // Create tasks collection with proper schema
    await this.milvusClient.createCollection({
      collection_name: COLLECTIONS.TASKS,
      fields: [
        { name: 'id', data_type: DataType.VARCHAR, is_primary_key: true },
        { name: 'name', data_type: DataType.VARCHAR },
        { name: 'description', data_type: DataType.VARCHAR },
        { name: 'due_date', data_type: DataType.VARCHAR },
        { name: 'project_id', data_type: DataType.VARCHAR },
        { name: 'assignee_id', data_type: DataType.VARCHAR },
        { name: 'completed', data_type: DataType.BOOL },
        { name: 'modified_at', data_type: DataType.VARCHAR },
        { name: 'embedding', data_type: DataType.FLOAT_VECTOR, dim: 1536 }
      ]
    });
  }

  private async createIndexes() {
    await this.milvusClient.createIndex({
      collection_name: COLLECTIONS.TASKS,
      field_name: 'embedding',
      index_type: 'IVF_FLAT',
      metric_type: 'L2',
      params: { nlist: 1024 }
    });
  }

  async upsertTask(task: AsanaTask, projectName?: string) {
    const embedding = await this.generateTaskEmbedding(task, projectName);
    
    await this.milvusClient.insert({
      collection_name: COLLECTIONS.TASKS,
      data: [{
        id: task.id,
        name: task.name,
        description: task.description,
        due_date: task.due_date,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        completed: task.completed,
        modified_at: task.modified_at,
        embedding
      }]
    });
  }

  async generateTaskEmbedding(task: AsanaTask, projectName?: string): Promise<number[]> {
    const contentToEmbed = [
      task.name,
      task.description,
      projectName,
      task.tags?.join(', '),
      task.custom_fields?.map(cf => `${cf.name}: ${cf.value}`).join(', ')
    ].filter(Boolean).join(' | ');

    return await this.embeddings.embedText(contentToEmbed);
  }

  async searchTasks(query: string, filters: SearchFilters = {}): Promise<AsanaTask[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    const searchParams: any = {
      collection_name: COLLECTIONS.TASKS,
      vector: queryEmbedding,
      limit: 10,
      output_fields: ['id', 'name', 'description', 'due_date', 'project_id', 'assignee_id', 'completed', 'modified_at'],
    };

    if (Object.keys(filters).length > 0) {
      const expressions: string[] = [];
      if (filters.projectId) expressions.push(`project_id == "${filters.projectId}"`);
      if (filters.assigneeId) expressions.push(`assignee_id == "${filters.assigneeId}"`);
      if (filters.dueBefore) expressions.push(`due_date <= "${filters.dueBefore}"`);
      if (typeof filters.completed === 'boolean') expressions.push(`completed == ${filters.completed}`);
      
      if (expressions.length > 0) {
        searchParams.expr = expressions.join(' && ');
      }
    }

    const searchResults = await this.milvusClient.search(searchParams);
    return searchResults.results;
  }

  async getPrioritizedTasks(query: string, userId: string): Promise<PrioritizedTask[]> {
    const tasks = await this.searchTasks(query, { 
      assigneeId: userId,
      completed: false 
    });
    
    return tasks.map(task => {
      const priorityScore = this.calculatePriorityScore(task);
      return {
        ...task,
        priorityScore: priorityScore.score,
        priorityReasons: priorityScore.reasons
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private calculatePriorityScore(task: AsanaTask): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Due date scoring
    if (task.due_date) {
      const daysUntilDue = this.getDaysUntilDue(task.due_date);
      const dueScore = this.getDueDateScore(daysUntilDue);
      score += dueScore;
      
      if (daysUntilDue < 0) {
        reasons.push(`Overdue by ${-daysUntilDue} days`);
      } else if (daysUntilDue === 0) {
        reasons.push('Due today');
      } else if (daysUntilDue <= 2) {
        reasons.push('Due in next 2 days');
      }
    }

    // Tag scoring
    if (task.tags) {
      const tagScore = this.getTagScore(task.tags);
      score += tagScore.score;
      if (tagScore.reason) reasons.push(tagScore.reason);
    }

    // Custom fields scoring
    if (task.custom_fields) {
      const customScore = this.getCustomFieldScore(task.custom_fields);
      score += customScore.score;
      if (customScore.reason) reasons.push(customScore.reason);
    }

    return { score, reasons };
  }

  private getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  private getDueDateScore(daysUntilDue: number): number {
    if (daysUntilDue < 0) return 100;
    if (daysUntilDue === 0) return 90;
    if (daysUntilDue <= 2) return 80;
    if (daysUntilDue <= 7) return 70;
    return Math.max(0, 60 - daysUntilDue);
  }

  private getTagScore(tags: string[]): { score: number; reason?: string } {
    let score = 0;
    let reason = '';

    if (tags.includes('urgent')) {
      score += 100;
      reason = 'Marked as urgent';
    } else if (tags.includes('high-priority')) {
      score += 50;
      reason = 'High priority task';
    }

    if (tags.includes('blocked')) {
      score -= 30;
      reason = 'Task is blocked';
    }

    return { score, reason };
  }

  private getCustomFieldScore(customFields: AsanaCustomField[]): { score: number; reason?: string } {
    let score = 0;
    let reason = '';

    // Add your custom field scoring logic here based on your Asana setup
    // Example:
    const priorityField = customFields.find(cf => cf.name.toLowerCase().includes('priority'));
    if (priorityField && typeof priorityField.value === 'string') {
      if (priorityField.value.toLowerCase().includes('high')) {
        score += 40;
        reason = 'High priority custom field';
      }
    }

    return { score, reason };
  }
}

export const taskVectorStore = new TaskVectorStore();