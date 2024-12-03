import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Task Finder',
  description: 'Find the most relevant task based on your description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <a href="/" className="text-xl font-medium text-slate-900">
                    Task Finder
                  </a>
                  <div className="hidden md:flex gap-6">
                    <a href="/projects" className="text-slate-600 hover:text-slate-900 transition-colors">Projects</a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}