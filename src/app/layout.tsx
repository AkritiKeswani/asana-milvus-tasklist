import type { Metadata } from 'next'
import Link from 'next/link' // Add this import
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
                  <Link href="/" className="flex items-center px-2 text-purple-700 font-medium">
                    Task Assistant
                  </Link>
                  <div className="ml-6 flex items-center space-x-4">
                    <Link href="/dashboard" className="text-gray-700 hover:text-purple-700">Dashboard</Link>
                    <Link href="/tasks" className="text-gray-700 hover:text-purple-700">All Tasks</Link>
                    <Link href="/projects" className="text-gray-700 hover:text-purple-700">Projects</Link>
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