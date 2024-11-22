import { milvusClient, COLLECTIONS } from './milvusClient';
import { openAIEmbeddings } from './openAI';
import type { AsanaTask, TaskWithEmbedding, SearchFilters, PrioritizedTask } from '../types/asana';
import { DataType } from '@zilliz/milvus2-sdk-node';

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
    await this.milvusClient.createCollection({
      collection_name: COLLECTIONS.TASKS,
      fields: [
        { name: 'id', data_type: DataType.VARCHAR, is_primary_key: true },
        { name: 'gid', data_type: DataType.VARCHAR },
        { name: 'name', data_type: DataType.VARCHAR },
        { name: 'description', data_type: DataType.VARCHAR },
        { name: 'due_on', data_type: DataType.VARCHAR },
        { name: 'projects', data_type: DataType.JSON },
        { name: 'assignee', data_type: DataType.JSON },
        { name: 'tags', data_type: DataType.JSON },
        { name: 'custom_fields', data_type: DataType.JSON },
        { name: 'completed', data_type: DataType.BOOL },
        { name: 'completed_at', data_type: DataType.VARCHAR },
        { name: 'created_at', data_type: DataType.VARCHAR },
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

  async upsertTask(task: AsanaTask) {
    const embedding = await this.generateTaskEmbedding(task);
    
    await this.milvusClient.insert({
      collection_name: COLLECTIONS.TASKS,
      data: [{
        id: task.id,
        gid: task.gid,
        name: task.name,
        description: task.description,
        due_on: task.due_on,
        projects: JSON.stringify(task.projects),
        assignee: JSON.stringify(task.assignee),
        tags: JSON.stringify(task.tags),
        custom_fields: JSON.stringify(task.custom_fields),
        completed: task.completed,
        completed_at: task.completed_at,
        created_at: task.created_at,
        modified_at: task.modified_at,
        embedding
      }]
    });
  }

  async generateTaskEmbedding(task: AsanaTask): Promise<number[]> {
    const contentToEmbed = [
      task.name,
      task.description,
      task.projects?.map(p => p.name).join(', '),
      task.tags?.map(t => t.name).join(', '),
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
      output_fields: ['id', 'gid', 'name', 'description', 'due_on', 'projects', 'assignee', 'tags', 'custom_fields', 'completed', 'completed_at', 'created_at', 'modified_at']
    };

    if (Object.keys(filters).length > 0) {
      const expressions: string[] = [];
      if (filters.projectId) expressions.push(`JSON_CONTAINS(projects, "${filters.projectId}", "$.id")`);
      if (filters.assigneeId) expressions.push(`JSON_CONTAINS(assignee, "${filters.assigneeId}", "$.id")`);
      if (filters.dueBefore) expressions.push(`due_on <= "${filters.dueBefore}"`);
      if (typeof filters.completed === 'boolean') expressions.push(`completed == ${filters.completed}`);
      
      if (expressions.length > 0) {
        searchParams.expr = expressions.join(' && ');
      }
    }

    const searchResults = await this.milvusClient.search(searchParams);
    return searchResults.results.map(result => ({
      ...result,
      projects: JSON.parse(result.projects),
      assignee: JSON.parse(result.assignee),
      tags: JSON.parse(result.tags),
      custom_fields: JSON.parse(result.custom_fields)
    }));
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

    if (task.due_on) {
      const daysUntilDue = this.getDaysUntilDue(task.due_on);
      score += this.getDueDateScore(daysUntilDue);
      
      if (daysUntilDue < 0) reasons.push(`Overdue by ${-daysUntilDue} days`);
      else if (daysUntilDue === 0) reasons.push('Due today');
      else if (daysUntilDue <= 2) reasons.push('Due soon');
    }

    const priorityField = task.custom_fields?.find(cf => 
      cf.name.toLowerCase().includes('priority')
    );
    
    if (priorityField?.value) {
      const value = priorityField.value.toLowerCase();
      if (value.includes('high')) {
        score += 40;
        reasons.push('High priority');
      }
    }

    task.tags?.forEach(tag => {
      if (tag.name === 'urgent') {
        score += 100;
        reasons.push('Urgent');
      }
    });

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
}

export const taskVectorStore = new TaskVectorStore();