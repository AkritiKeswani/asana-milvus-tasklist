export interface TaskVector {
    id: string;
    name: string;
    description: string;
    embedding: number[];
    workspace: string;
    userId: string;
    project_id?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
    due_date?: string;
    status: string;
    priority?: number;
    assignee?: string;
    created_at: string;
    modified_at: string;
  }
  
  export interface PrioritizedTask {
    id: string;
    name: string;
    description: string;
    priorityScore: number;
    priorityReasons: string[];
    status: string;
    due_date?: string;
    assignee?: string;
    project_id?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
  }
  
  export interface AdvancedSearchParams {
    embedding: number[];
    limit?: number;
    workspace?: string;
    userId?: string;
    project_id?: string;
    status?: string;
    assignee?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
    projects?: string[];
    due_date_start?: string;
    due_date_end?: string;
  }
  
  export interface SearchResult extends TaskVector {
    score: number;
  }