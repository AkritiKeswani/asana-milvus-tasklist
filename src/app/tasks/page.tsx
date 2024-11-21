'use client';

import { useState } from 'react';
import type { PrioritizedTask } from '@/types/asana';

export default function TasksPage() {
  const [tasks, setTasks] = useState<PrioritizedTask[]>([]);
  const [filter, setFilter] = useState('all'); // all, today, overdue

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Tasks</h1>
        <div className="space-x-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border p-2"
          >
            <option value="all">All Tasks</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No tasks found</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="border-b last:border-b-0 py-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{task.name}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}