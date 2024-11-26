"use client";

import React, { useState, useEffect } from "react";

interface Task {
  id: string;
  name: string;
  description?: string;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/tasks");
        
        if (!response.ok) {
          throw new Error(
            `Failed to fetch tasks (${response.status}): ${response.statusText}`
          );
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.tasks)) {
          throw new Error("Invalid response format from server");
        }
        
        setTasks(data.tasks);
      } catch (err) {
        // Type guard for Error objects
        const errorMessage = err instanceof Error 
          ? err.message 
          : "An unexpected error occurred while fetching tasks";
          
        // Safe error logging for client component
        if (process.env.NODE_ENV !== 'production') {
          // Only log in development
          const errorDetails = err instanceof Error ? err : new Error(String(err));
          console.warn('[Task Fetch Error]:', errorDetails);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">
            {error}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Tasks</h1>
      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 bg-white rounded-xl shadow-md border border-gray-200"
            >
              <h2 className="font-semibold text-xl text-gray-800">{task.name}</h2>
              {task.description && (
                <p className="text-gray-600 mt-2">{task.description}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-lg">No tasks available.</p>
        </div>
      )}
    </div>
  );
}