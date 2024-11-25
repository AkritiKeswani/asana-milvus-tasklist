"use client";

import React, { useState, useEffect } from "react";

// Define the structure of a task for type safety
interface Task {
  id: string;
  name: string;
  description?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]); // Task state with type safety
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch tasks from the API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true); // Show loading spinner
      setError(null); // Reset error state
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error(`Error fetching tasks: ${response.statusText}`);
        }
        const data = await response.json();
        setTasks(data.tasks || []); // Safely handle tasks
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchTasks(); // Call fetch function
  }, []); // Run once on component mount

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading tasks...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">
            {error || "An error occurred while fetching tasks."}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            onClick={() => window.location.reload()} // Reload page to retry
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render tasks
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