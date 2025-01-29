"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface AsanaCustomField {
  id: string
  name: string
  type: string
  value?: string | number | boolean | null
}

interface PrioritizedTask {
  id: string
  name: string
  description?: string
  due_date?: string
  tags?: string[]
  project_id?: string
  assignee_id?: string
  custom_fields?: AsanaCustomField[]
  completed: boolean
  modified_at: string
  priorityScore: number
  similarityPercentage: string
  priorityReasons: string[]
}

interface ApiResponse {
  tasks: PrioritizedTask[]
  summary: string
}

interface PageProps {}

export default function TaskDashboard(): JSX.Element {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tasks/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: query }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data: ApiResponse = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1>Welcome to Task Finder</h1>
      <p>This is where you&apos;ll find and manage your tasks.</p>
      {/* Search Section */}
      <div className="bg-navy-700/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-navy-400/10">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">Task Prioritization Assistant</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to prioritize today?"
                className="w-full p-4 bg-navy-800/50 border border-navy-400/10 rounded-lg shadow-sm focus:ring-2 focus:ring-navy-300/50 focus:border-navy-300/50 outline-none text-lg text-white placeholder-navy-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-500 text-white p-4 rounded-lg font-medium hover:bg-navy-400 disabled:bg-navy-600/50 disabled:text-navy-300 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {loading ? "Loading Task Details..." : "Give me an ordered list"}
            </button>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-900/10 border border-red-400/10 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {response && (
        <div className="mt-6 space-y-6">
          {/* Task Summary */}
          <div className="bg-navy-700/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-navy-400/10">
            <h2 className="text-2xl font-bold mb-4 text-white">Task Overview</h2>
            <div className="prose max-w-none">
              <p className="text-navy-100">{response.summary}</p>
            </div>
          </div>

          {/* Task Details */}
          <div className="bg-navy-700/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-navy-400/10">
            <h2 className="text-2xl font-bold mb-6 text-white">Task Details</h2>
            <div className="space-y-4">
              {response.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-navy-800/50 rounded-lg border border-navy-400/10 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-lg text-white">{task.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        task.custom_fields?.find((f) => f.name === "Priority")?.value === "High"
                          ? "bg-red-500/20 text-red-300"
                          : task.custom_fields?.find((f) => f.name === "Priority")?.value === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {task.custom_fields?.find((f) => f.name === "Priority")?.value}
                    </span>
                  </div>
                  {task.description && <p className="text-navy-100 mt-3 leading-relaxed">{task.description}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-navy-200">Assignee</p>
                      <p className="text-navy-100">Akriti Keswani</p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-200">Due Date</p>
                      <p className="text-navy-100">{task.due_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-200">Project</p>
                      <p className="text-navy-100">Building AI Apps</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {task.priorityReasons.map((reason, index) => (
                      <span
                        key={index}
                        className="inline-block bg-navy-600/50 text-navy-100 px-3 py-1 rounded-full text-sm"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

