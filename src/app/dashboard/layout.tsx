// app/dashboard/page.tsx
'use client';

import { useState } from 'react';

interface AsanaCustomField {
  id: string;
  name: string;
  type: string;
  value?: any;
}

interface PrioritizedTask {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  tags?: string[];
  project_id?: string;
  assignee_id?: string;
  custom_fields?: AsanaCustomField[];
  completed: boolean;
  modified_at: string;
  priorityScore: number;
  priorityReasons: string[];
}

interface ApiResponse {
  tasks: PrioritizedTask[];
  summary: string;
}

export default function TaskDashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Dummy data matching the Asana task
      const dummyResponse: ApiResponse = {
        tasks: [
          {
            id: '1',
            name: 'Fix the Frontend Bugs on Entry Point tsx page for Roboadvisor App',
            description: 'Building an ETF roboadvisor (robomystic) that recommends top ETFs for you to invest in based on how much funds you have + your investing risk appetite',
            due_date: 'Tuesday',
            project_id: 'building-ai-apps',
            assignee_id: 'akriti-keswani',
            completed: false,
            modified_at: new Date().toISOString(),
            priorityScore: 90,
            priorityReasons: ['High Priority', 'Bug Fix', 'Blocking Development'],
            custom_fields: [
              {
                id: 'priority',
                name: 'Priority',
                type: 'enum',
                value: 'High'
              }
            ]
          },
          {
            id: '2',
            name: 'Music Recommender AI - Spotify Web API',
            description: 'Building a web application that allows you to enter your current mood and based on this, generates a list of recommended artists and associated songs which fit into this bucket.',
            due_date: 'Wednesday',
            project_id: 'building-ai-apps',
            assignee_id: 'akriti-keswani',
            completed: false,
            modified_at: new Date().toISOString(),
            priorityScore: 85,
            priorityReasons: ['Medium Priority', 'AI', 'User Experience'],
            custom_fields: [
              {
                id: 'priority',
                name: 'Priority',
                type: 'enum',
                value: 'Medium'
              }
            ]
          },
          {
            id: '3',
            name: 'Doctors.fyi Landing Page to Include Running Dashboard of Doc Salaries',
            description: 'Display doctor salaries derived from dashboard on frontend landing page entry point, so users can get a sneak peek into the app before even having to authenticate or log in!',
            due_date: 'Thursday',
            tags: ['AI'],
            project_id: 'building-ai-apps',
            assignee_id: 'akriti-keswani',
            completed: false,
            modified_at: new Date().toISOString(),
            priorityScore: 70,
            priorityReasons: ['Low Priority', 'Frontend Enhancement'],
            custom_fields: [
              {
                id: 'priority',
                name: 'Priority',
                type: 'enum',
                value: 'Low'
              }
            ]
          }
        ],
        summary: `Based on your query "${query}", here are your tasks in order of priority: First, tackle the Roboadvisor frontend bugs (High priority) due Tuesday. Next, work on the Spotify Music Recommender (Medium priority) due Wednesday. The Doctors.fyi dashboard enhancement (Low priority) due Thursday can be handled after the higher priority items are addressed.`
      };

      setResponse(dummyResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
              {loading ? 'Loading Task Details...' : 'Give me an ordered list'}
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      task.custom_fields?.find(f => f.name === 'Priority')?.value === 'High' 
                        ? 'bg-red-500/20 text-red-300'
                        : task.custom_fields?.find(f => f.name === 'Priority')?.value === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {task.custom_fields?.find(f => f.name === 'Priority')?.value}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-navy-100 mt-3 leading-relaxed">{task.description}</p>
                  )}
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
  );
}