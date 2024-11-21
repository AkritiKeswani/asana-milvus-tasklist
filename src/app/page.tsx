"use client";

import { useState } from "react";

interface Task {
  id: string;
  title: string;
  priority: string;
}

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!input.trim()) {
      setError("Please enter a task description.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An error occurred");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center mb-6">
          Task Prioritizer
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Describe your task, and let AI prioritize it for you!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your task"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Prioritizing..." : "Prioritize"}
          </button>
        </form>

        {/* Display Prioritized Tasks */}
        {tasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Prioritized Tasks
            </h2>
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                >
                  <h3 className="font-bold text-lg text-blue-600">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Priority: {task.priority}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
