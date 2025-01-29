export interface MilvusSearchItem {
  id: string;
  name: string;
  description: string;
  workspace: string;
  userId: string;
  project_id: string;
  status: string;
  due_date: string;
  priority: number;
  assignee: string;
  created_at: string;
  modified_at: string;
  score: number;
}

export interface MilvusSearchResult {
  results: MilvusSearchItem[];
} 