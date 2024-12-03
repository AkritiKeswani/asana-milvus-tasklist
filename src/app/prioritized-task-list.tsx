'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  name: string;
  priorityScore: number;
  priorityReasons?: string[];
}

interface PrioritizeResponse {
  success: boolean;
  query: string;
  tasks: Task[];
  summary: string;
  tasksFound: number;
}

export default function PrioritizedTaskList() {
  const [query, setQuery] = useState('');
  const [prioritizedTasks, setPrioritizedTasks] = useState<PrioritizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePrioritize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: 'user123', // Replace with actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prioritize tasks');
      }

      const data: PrioritizeResponse = await response.json();
      setPrioritizedTasks(data);
    } catch (err) {
      setError('Failed to prioritize tasks. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="flex-grow"
        />
        <Button onClick={handlePrioritize} disabled={loading}>
          {loading ? 'Prioritizing...' : 'Prioritize Tasks'}
        </Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {prioritizedTasks && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="mb-4">{prioritizedTasks.summary}</p>
          <h2 className="text-xl font-semibold mb-2">Prioritized Tasks</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prioritizedTasks.tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>{task.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Priority Score: {task.priorityScore.toFixed(2)}</p>
                  {task.priorityReasons && (
                    <div>
                      <p className="font-semibold">Reasons:</p>
                      <ul className="list-disc list-inside">
                        {task.priorityReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

