'use client';

import React, { useState, useEffect } from "react";

interface Task {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  tags?: string[];
  project_id?: string;
  assignee_id?: string;
  priority?: string;
  priority_reasons?: string;
  project?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getPriorityReasons = (reasons?: string): string[] => {
    if (!reasons) return [];
    try {
      return JSON.parse(reasons);
    } catch {
      return reasons.split(',').map(r => r.trim());
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-slate-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-10 text-slate-900">All Tasks</h1>
      
      {tasks.length > 0 ? (
        <div className="space-y-8">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-8 bg-white rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <h2 className="font-semibold text-xl text-slate-900">{task.name}</h2>
                {task.priority && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'High' 
                      ? 'bg-red-100 text-red-600'
                      : task.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className="text-slate-700 mt-4 text-sm leading-relaxed">{task.description}</p>
              )}
              
              <div className="mt-6 flex flex-wrap gap-8 text-sm">
                {task.project && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Project</p>
                    <p className="text-slate-700">{task.project}</p>
                  </div>
                )}
                {task.assignee_id && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Assignee</p>
                    <p className="text-slate-700">Akriti Keswani</p>
                  </div>
                )}
                {task.due_date && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Due Date</p>
                    <p className="text-slate-700">{task.due_date}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {getPriorityReasons(task.priority_reasons).map((reason, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs"
                  >
                    {reason}
                  </span>
                ))}
                {task.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No tasks available.</p>
        </div>
      )}
    </div>
  );
}