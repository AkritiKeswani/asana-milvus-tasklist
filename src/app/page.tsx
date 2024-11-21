'use client';

import { useState } from 'react';

interface AsanaCustomField {
  id: string;
  name: string;
  type: string;
  value?: any;
}

interface PrioritizedTask {
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
  priorityScore: number;
  priorityReasons: string[];
}

interface ApiResponse {
  tasks: PrioritizedTask[];
  summary: string;
}

export default function TaskDashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await fetch('/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          userId: 'your-user-id'
        })
      });

      if (!result.ok) {
        throw new Error('Failed to fetch priorities');
      }

      const data = await result.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg"> {/* Changed from max-w-3xl to max-w-lg */}
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg aspect-[4/3] flex flex-col p-8"> {/* Added aspect ratio and flex */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center mb-8">Task Prioritization Assistant</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto w-full">
              <div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What should I work on today?"
                  className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-100 text-purple-700 p-4 rounded-lg font-medium hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {loading ? 'Analyzing Tasks...' : 'Get tasks in order of priority'}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {response && (
          <div className="mt-6 space-y-6">
            {/* AI Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">AI Summary</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{response.summary}</p>
              </div>
            </div>

            {/* Prioritized Tasks */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Prioritized Tasks</h2>
              <div className="space-y-4">
                {response.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-lg text-gray-900">{task.name}</h3>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        Score: {task.priorityScore}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mt-3 leading-relaxed">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-3">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {task.priorityReasons.map((reason, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}