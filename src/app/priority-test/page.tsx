'use client';
import React, { useState, useEffect } from 'react';

interface PriorityTestState {
  query: string;
  filters: {
    status?: string;
    workspace?: string;
    project_id?: string;
  };
  loading: boolean;
  response: any;
  error: string | null;
  testResults: any;
}

export default function PriorityTestPage() {
  const [state, setState] = useState<PriorityTestState>({
    query: "What are my highest priority tasks?",
    filters: {
      status: "not completed"
    },
    loading: false,
    response: null,
    error: null,
    testResults: null
  });

  const runTest = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch('/api/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: state.query,
          userId: 'test-user',
          filters: state.filters
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch priorities');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        response: data
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Priority Test Dashboard</h1>

      {/* Test Controls */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Query:</label>
            <input
              type="text"
              value={state.query}
              onChange={(e) => setState(prev => ({
                ...prev,
                query: e.target.value
              }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status Filter:</label>
            <select
              value={state.filters.status}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: { ...prev.filters, status: e.target.value }
              }))}
              className="w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="not completed">Not Completed</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <button
            onClick={runTest}
            disabled={state.loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            {state.loading ? 'Processing...' : 'Run Priority Test'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{state.error}</p>
        </div>
      )}

      {/* Results Display */}
      {state.response && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p className="text-gray-700">{state.response.summary}</p>
          </div>

          {/* Prioritized Tasks */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Prioritized Tasks</h2>
            <div className="space-y-4">
              {state.response.tasks?.map((task: any, index: number) => (
                <div key={task.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">#{index + 1}: {task.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Priority Score: {task.priorityScore.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {task.status}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>Reasons:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {task.priorityReasons.map((reason: string, i: number) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Response */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Raw Response</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(state.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}