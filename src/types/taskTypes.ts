export interface PrioritizedTask {
  id: string
  name: string
  description?: string
  status: string
  workspace: string
  userId: string
  project_id?: string
  due_date?: string
  priority?: number
  assignee?: string
  created_at: string
  modified_at: string
  priorityScore: number
  priorityReasons: string[]
}

export interface SearchResult {
  id: string
  name: string
  description: string
  workspace: string
  userId: string
  project_id: string
  status: string
  due_date: string
  priority: number
  assignee: string
  created_at: string
  modified_at: string
  embedding?: number[]
} 