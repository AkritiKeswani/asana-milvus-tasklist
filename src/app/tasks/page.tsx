"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Example functional component
const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: Fetch tasks or any client-side logic
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return <Loader2 />;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            tasks.map((task) => <div key={task.id}>{task.title}</div>)
          ) : (
            <Alert>
              <AlertCircle />
              <AlertDescription>No tasks available.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
