"use client";

import { useState } from "react";

interface Task {
  id: string;
  task_title: string;
  task_description: string;
  priority: string;
}

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!input.trim()) {
      setError("Input cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || "Failed to fetch tasks");
        return;
      }

      const { tasks } = await response.json();
      setTasks(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div>
      <h1>Task Prioritizer</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task"
        />
        <button type="submit">Prioritize</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {tasks.length > 0 && (
        <div>
          <h2>Prioritized Tasks</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.task_title}</strong> - {task.task_description}{" "}
                (Priority: {task.priority})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
