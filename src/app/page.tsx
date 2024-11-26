'use client';

import React, { useState } from 'react';

// Define interfaces
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
  success: boolean;
  tasksFound: number;
}

// Define the component as a React Function Component
const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('Sending request to /api/prioritize');
      const result = await fetch('/api/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          userId: 'test-user'
        })
      });

      console.log('Response status:', result.status);
      
      const contentType = result.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }

      const data = await result.json();
      console.log('Response data:', data);

      if (!result.ok) {
        throw new Error(data.error || `Server error: ${result.status}`);
      }

      setResponse(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg aspect-[4/3] flex flex-col p-8">
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

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {response?.success && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">AI Summary</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{response.summary}</p>
              </div>
            </div>

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
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        Score: {task.priorityScore.toFixed(1)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mt-3">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-3">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    {task.priorityReasons?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.priorityReasons.map((reason, index) => (
                          <span 
                            key={index}
                            className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// Export the component
export default Home;