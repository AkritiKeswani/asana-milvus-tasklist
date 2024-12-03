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
  similarityPercentage: string;
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
      const response = await fetch('/api/tasks/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to fetch tasks: ' + errorText);
      }

      const data: ApiResponse = await response.json();
      setResponse(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg aspect-[4/3] flex flex-col p-8 border border-slate-200">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center mb-4 text-slate-800">Task Finder</h2>
            <p className="text-center text-slate-600 mb-8">Describe what you're looking for, and we'll find the most relevant task.</p>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto w-full">
              <div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe the task you're looking for..."
                  className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-100 text-blue-700 p-4 rounded-lg font-medium hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {loading ? 'Finding Task...' : 'Find Task'}
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
        {response && response.tasks.length > 0 && (
          <div className="mt-6 space-y-6">
            {/* Match Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed text-center">{response.summary}</p>
              </div>
            </div>

            {/* Task Details */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Matching Task</h2>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  {response.tasks[0].similarityPercentage}% Match
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-3">{response.tasks[0].name}</h3>
                {response.tasks[0].description && (
                  <p className="text-slate-600 leading-relaxed mb-4">{response.tasks[0].description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Assignee</p>
                    <p className="text-slate-700 font-medium">Akriti Keswani</p>
                  </div>
                  {response.tasks[0].due_date && (
                    <div>
                      <p className="text-sm text-slate-500">Due Date</p>
                      <p className="text-slate-700 font-medium">
                        {new Date(response.tasks[0].due_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Project</p>
                    <p className="text-slate-700 font-medium">Building AI Apps</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {response.tasks[0].priorityReasons.map((reason, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {response && response.tasks.length === 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-slate-200 text-center">
            <p className="text-slate-700">{response.summary}</p>
            <p className="text-slate-500 mt-2">Try describing the task differently.</p>
          </div>
        )}
      </div>
    </main>
  );
}