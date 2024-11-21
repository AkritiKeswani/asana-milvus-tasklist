'use client';

import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  taskCount: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <p className="text-gray-600 col-span-full text-center py-8">No projects found</p>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasks</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
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