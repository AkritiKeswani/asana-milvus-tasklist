import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asana Task Prioritization',
  description: 'AI-powered task prioritization for Asana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <a href="/" className="flex items-center px-2 text-purple-700 font-medium">
                    Task Assistant
                  </a>
                  <div className="ml-6 flex items-center space-x-4">
           
                    <a href="/tasks" className="text-gray-700 hover:text-purple-700">All Tasks</a>
                    <a href="/projects" className="text-gray-700 hover:text-purple-700">Projects</a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}