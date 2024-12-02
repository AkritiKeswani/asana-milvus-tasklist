'use client';

import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  taskCount: number;
}

export default function ProjectsPage() {
  // Hardcoded projects data
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Building AI Apps',
      description: 'Collection of AI-powered applications including Roboadvisor, Music Recommender, and more.',
      taskCount: 3
    },
    {
      id: '2',
      name: 'Doctors.fyi',
      description: 'Doctor salary transparency platform with integrated dashboard and analytics.',
      taskCount: 1
    }
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <p className="text-slate-600 col-span-full text-center py-8">No projects found</p>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200"
            >
              <h2 className="text-xl font-semibold mb-2 text-slate-800">{project.name}</h2>
              {project.description && (
                <p className="text-slate-600 mb-4">{project.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tasks</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {project.taskCount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}