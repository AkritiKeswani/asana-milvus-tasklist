import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task Statistics Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tasks</span>
              <span className="text-purple-700 font-medium">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Due Today</span>
              <span className="text-purple-700 font-medium">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="text-purple-700 font-medium">1</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/tasks" className="block w-full bg-purple-100 text-purple-700 p-3 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center">
              View All Tasks
            </Link>
            <Link href="/prioritize" className="block w-full bg-purple-100 text-purple-700 p-3 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center">
              Prioritize Tasks
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}