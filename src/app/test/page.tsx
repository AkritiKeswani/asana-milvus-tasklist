'use client';
import React, { useState } from 'react';

export default function TestPage() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("What should I work on next?");

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: "test-user",
          filters: {
            status: "not completed"
          }
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Prioritization API Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Query:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your query"
        />
      </div>

      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Test Prioritization'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Summary:</h2>
            <div className="p-4 bg-gray-50 rounded">
              {response.summary}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Prioritized Tasks:</h2>
            <div className="space-y-4">
              {response.tasks?.map((task: any, index: number) => (
                <div key={task.id} className="p-4 bg-white shadow rounded">
                  <div className="font-medium text-lg">
                    #{index + 1}: {task.name}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {task.description}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Priority Score:</span> {task.priorityScore.toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Reasons:</span> {task.priorityReasons.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Raw Response:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}