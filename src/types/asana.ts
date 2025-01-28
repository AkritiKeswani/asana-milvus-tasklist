// Core interfaces for Airbyte-synced data
export interface AsanaUser {
    id: string;
    name: string;
    email: string;
  }
  
  export interface AsanaProject {
    id: string;
    name: string;
    description?: string;
    custom_fields?: AsanaCustomField[];
    is_template: boolean;
    created_at: string;
    modified_at: string;
  }
  
  export interface AsanaCustomField {
    id: string;
    name: string;
    type: string;
    value?: string | number | boolean | null;
    enum_options?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
  }
  
  export interface AsanaTag {
    id: string;
    name: string;
    color?: string;
  }
  
  export interface AsanaTask {
    id: string;
    gid: string;
    name: string;
    description?: string;
    due_on?: string;
    due_at?: string;
    tags: AsanaTag[];
    projects: AsanaProject[];
    assignee: AsanaUser | null;
    custom_fields: AsanaCustomField[];
    completed: boolean;
    completed_at?: string;
    created_at: string;
    modified_at: string;
    resource_type: string;
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