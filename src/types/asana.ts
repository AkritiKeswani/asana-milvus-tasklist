export interface AsanaUser {
    id: string;
    name: string;
    email: string;
  }
  
  export interface AsanaProject {
    id: string;
    name: string;
    description?: string;
  }
  
  export interface AsanaCustomField {
    id: string;
    name: string;
    type: string;
    value?: any;
  }
  
  export interface AsanaTag {
    id: string;
    name: string;
  }
  
  export interface AsanaTask {
    id: string;
    name: string;
    description?: string;
    due_date?: string;
    tags?: string[];
    project_id?: string;
    assignee_id?: string;
    custom_fields?: AsanaCustomField[];
    completed: boolean;
    modified_at: string;
  }
  
  export interface TaskWithEmbedding extends AsanaTask {
    embedding: number[];
  }
  
  export interface SearchFilters {
    projectId?: string;
    assigneeId?: string;
    dueBefore?: string;
    tags?: string[];
    completed?: boolean;
  }
  
  export interface PrioritizedTask extends AsanaTask {
    priorityScore: number;
    priorityReasons: string[];
  }