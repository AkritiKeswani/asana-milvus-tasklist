// import { useState, useEffect } from 'react';
// import Link from 'next/link';

// export default function DashboardPage() {
//   const [taskStats, setTaskStats] = useState({
//     total: 0,
//     dueToday: 0,
//     overdue: 0
//   });
//   const [query, setQuery] = useState("What should I work on today?");
//   const [prioritizedTasks, setPrioritizedTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [summary, setSummary] = useState("");

//   const fetchPrioritizedTasks = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch('/api/prioritize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           query,
//           userId: 'current-user' // Replace with actual user ID from your auth system
//         })
//       });

//       if (!response.ok) throw new Error('Failed to fetch tasks');
      
//       const data = await response.json();
//       setPrioritizedTasks(data.tasks);
//       setSummary(data.summary);
      
//       // Update task statistics
//       setTaskStats({
//         total: data.tasksFound || 0,
//         dueToday: data.tasks.filter(task => 
//           new Date(task.due_date).toDateString() === new Date().toDateString()
//         ).length,
//         overdue: data.tasks.filter(task => 
//           new Date(task.due_date) < new Date()
//         ).length
//       });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Dashboard</h1>
//         <div className="flex gap-4">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="px-4 py-2 border rounded-lg"
//             placeholder="What should I work on today?"
//           />
//           <button
//             onClick={fetchPrioritizedTasks}
//             disabled={loading}
//             className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
//           >
//             {loading ? 'Loading...' : 'Prioritize'}
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         {/* Task Statistics Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Total Tasks</span>
//               <span className="text-purple-700 font-medium">{taskStats.total}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Due Today</span>
//               <span className="text-purple-700 font-medium">{taskStats.dueToday}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Overdue</span>
//               <span className="text-purple-700 font-medium">{taskStats.overdue}</span>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">AI Summary</h2>
//           <div className="space-y-4">
//             {summary ? (
//               <p className="text-gray-600">{summary}</p>
//             ) : (
//               <p className="text-gray-600">Ask me what you should work on!</p>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
//           <div className="space-y-4">
//             <Link href="/tasks" className="block w-full bg-purple-100 text-purple-700 p-3 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center">
//               View All Tasks
//             </Link>
//             <Link href="/prioritize" className="block w-full bg-purple-100 text-purple-700 p-3 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center">
//               Advanced Prioritization
//             </Link>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Prioritized Tasks Section */}
//       {prioritizedTasks.length > 0 && (
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Prioritized Tasks</h2>
//           <div className="space-y-4">
//             {prioritizedTasks.map((task) => (
//               <div 
//                 key={task.id}
//                 className="p-4 border rounded-lg hover:border-purple-300 transition-colors"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="text-lg font-medium">{task.name}</h3>
//                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
//                     Priority: {task.priorityScore.toFixed(1)}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 mb-2">{task.notes}</p>
//                 <div className="text-sm text-gray-500">
//                   Due: {new Date(task.due_date).toLocaleDateString()}
//                 </div>
//                 {task.priorityReasons && (
//                   <div className="mt-2 text-sm text-gray-500">
//                     Reasons: {task.priorityReasons.join(', ')}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }