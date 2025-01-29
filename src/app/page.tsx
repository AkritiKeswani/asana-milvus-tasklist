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
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ text: query }),
     })

     if (!response.ok) throw new Error("Failed to fetch tasks")
     const data: ApiResponse = await response.json()
     setResponse(data)
   } catch (err) {
     setError(err instanceof Error ? err.message : "An error occurred")
   } finally {
     setLoading(false)
   }
 }

 return (
   <div className="min-h-screen bg-black">
     {/* Fixed Search Header */}
     <div className="fixed top-0 left-0 right-0 bg-black border-b border-white/10 z-50">
       <div className="max-w-3xl mx-auto px-4 py-6">
         <h1 className="text-2xl font-bold text-white text-center mb-2">Task Prioritization Assistant</h1>
         <p className="text-white/60 text-sm text-center mb-6">
           Let me help you find and prioritize your Asana tasks. Try describing what you're looking for, like
           with a keyword such as "frontend" to find frontend related tasks for example.
         </p>
         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           <input
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder='e.g., "Find all my tasks related to doctor appointments"'
             className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                      text-white placeholder-white/50 outline-none focus:border-white/20
                      transition-colors text-lg"
           />
           <button
             type="submit"
             disabled={loading}
             className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                      hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors text-lg font-medium"
           >
             {loading ? "Searching tasks..." : "Search Tasks"}
           </button>
         </form>
       </div>
     </div>

     {/* Main Content with Padding for Fixed Header */}
     <div className="pt-48 pb-12 max-w-3xl mx-auto px-4">
       {error && (
         <div className="mb-8 p-4 border border-white/10 rounded-lg">
           <p className="text-white/70 text-center">{error}</p>
         </div>
       )}

       {response && (
         <div className="space-y-8">
           <div className="text-sm text-white/60 text-center">{response.summary}</div>

           <div className="space-y-4">
             {response.tasks.map((task) => (
               <div
                 key={task.id}
                 className="p-6 border border-white/10 rounded-lg hover:border-white/20
                          transition-colors"
               >
                 <div className="flex items-start justify-between gap-4 mb-4">
                   <h3 className="text-lg font-medium text-white">{task.name}</h3>
                   <span className="px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                     {task.similarityPercentage}% match
                   </span>
                 </div>

                 {task.description && (
                   <p className="mb-4 text-white/70 text-sm">{task.description}</p>
                 )}

                 <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                   <div>
                     <span className="text-white/50">Due</span>
                     <p className="text-white mt-1">{task.due_date || "—"}</p>
                   </div>
                   <div>
                     <span className="text-white/50">Priority</span>
                     <p className="text-white mt-1">
                       {task.custom_fields?.find((f) => f.name === "Priority")?.value || "—"}
                     </p>
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                   {task.priorityReasons.map((reason, index) => (
                     <span
                       key={index}
                       className="px-2 py-1 bg-white/5 rounded text-xs text-white/70"
                     >
                       {reason}
                     </span>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   </div>
 )
}