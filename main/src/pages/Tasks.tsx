import React, { useState } from "react"
import { Plus, Filter, Calendar, User } from "lucide-react"

const mockTasks = [
  { id: 1, title: "Follow up with lead #1234", status: "pending", priority: "high", assignee: "John Doe", dueDate: "2024-01-15" },
  { id: 2, title: "Review contract proposal", status: "in-progress", priority: "medium", assignee: "Jane Smith", dueDate: "2024-01-16" },
  { id: 3, title: "Prepare monthly report", status: "done", priority: "low", assignee: "Bob Wilson", dueDate: "2024-01-14" },
  { id: 4, title: "Client onboarding call", status: "pending", priority: "high", assignee: "Alice Brown", dueDate: "2024-01-17" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-100 text-orange-500"
    case "in-progress":
      return "bg-orange-100 text-orange-500"
    case "done":
      return "bg-orange-100 text-orange-500"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-orange-100 text-black"
    case "medium":
      return "bg-orange-100 text-black"
    case "low":
      return "bg-orange-100 text-black"
    default:
      return "bg-orange-100 text-black"
  }
}

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
)

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-5 py-3 border-b border-gray-100 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

const AddTaskModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px]  font-semibold bg-orange-500 text-white "
      >
        <Plus className="h-4 w-4" /> Add Task
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className=" px-4 py-2.5 rounded-[10px]  font-semibold bg-orange-500 text-white "
                >
                  Save Task
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-[10px] text-sm font-semibold border border-orange-500 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Tasks() {
  const [view, setView] = useState<"list" | "kanban">("list")

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage and track all your tasks efficiently</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <AddTaskModal />
          </div>
        </div>

        {/* View Toggle */}
        <div className="inline-flex h-11 items-center rounded-xl bg-gray-100 p-1 mb-6 shadow-inner">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "list" ? "bg-orange-500 rounded-[10px] text-white shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "kanban" ? "bg-white border border-orange-500 text-gray-900 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Kanban Board
          </button>
        </div>

        {/* List View */}
        {view === "list" && (
          <div className="space-y-4">
            {mockTasks.map((task) => (
              <Card key={task.id} className="hover:scale-[1.01] transition-transform">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" /> {task.assignee}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {task.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Pending", "In Progress", "Done"].map((status) => (
              <Card key={status} className="bg-gray-50">
                <CardHeader>
                  <CardTitle>{status}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockTasks
                    .filter((task) => task.status === status.toLowerCase().replace(" ", "-"))
                    .map((task) => (
                      <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">{task.assignee}</span>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
