'use client';

import React, { useState } from "react";

interface Task {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  tags?: string[];
  project_id?: string;
  assignee_id?: string;
  priority?: string;
  priorityReasons?: string[];
  project: string;
}

export default function TasksPage() {
  // Hardcoded tasks combining both projects
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Fix the Frontend Bugs on Entry Point tsx page for Roboadvisor App',
      description: 'Building an ETF roboadvisor (robomystic) that recommends top ETFs for you to invest in based on how much funds you have + your investing risk appetite',
      due_date: 'Tuesday',
      project_id: 'building-ai-apps',
      assignee_id: 'akriti-keswani',
      priority: 'High',
      priorityReasons: [ 'Bug Fix', 'AI'],
      project: 'Building AI Apps'
    },
    {
      id: '2',
      name: 'Music Recommender AI - Spotify Web API',
      description: 'Building a web application that allows you to enter your current mood and based on this, generates a list of recommended artists and associated songs which fit into this bucket.',
      due_date: 'Wednesday',
      project_id: 'building-ai-apps',
      assignee_id: 'akriti-keswani',
      priority: 'Medium',
      priorityReasons: [ 'AI'],
      project: 'Building AI Apps'
    },
    {
      id: '3',
      name: 'Doctors.fyi Landing Page to Include Running Dashboard of Doc Salaries',
      description: 'Display doctor salaries derived from dashboard on frontend landing page entry point, so users can get a sneak peek into the app before even having to authenticate or log in!',
      due_date: 'Thursday',
      project_id: 'Building AI Apps',
      assignee_id: 'akriti-keswani',
      priority: 'Low',
      tags: [],
      priorityReasons: [],
      project: 'Building AI Apps'
    },
    {
      id: '4',
      name: 'Figure out how to scrape UpToDate for drug interaction data',
      project_id: 'doctors-fyi',
      project: 'Doctors.fyi Prod',
      description: 'Research and implement a solution for extracting drug interaction information from UpToDate',
      assignee_id: 'akriti-keswani'
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">All Tasks</h1>
      
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 bg-white rounded-xl shadow-lg border border-slate-200"
            >
              <div className="flex justify-between items-start gap-4">
                <h2 className="font-semibold text-xl text-slate-800">{task.name}</h2>
                {task.priority && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    task.priority === 'High' 
                      ? 'bg-blue-100 text-blue-700'
                      : task.priority === 'Medium'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className="text-slate-600 mt-3 leading-relaxed">{task.description}</p>
              )}
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Project</p>
                  <p className="text-slate-700">{task.project}</p>
                </div>
                {task.assignee_id && (
                  <div>
                    <p className="text-sm text-slate-500">Assignee</p>
                    <p className="text-slate-700">Akriti Keswani</p>
                  </div>
                )}
                {task.due_date && (
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="text-slate-700">{task.due_date}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {task.priorityReasons?.map((reason, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {reason}
                  </span>
                ))}
                {task.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-slate-600 text-lg">No tasks available.</p>
        </div>
      )}
    </div>
  );
}