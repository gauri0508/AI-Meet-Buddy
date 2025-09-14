import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Search, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import TaskList from '../components/TaskList'
import TaskEditor from '../components/TaskEditor'
import TaskCalendar from '../components/TaskCalendar'
import { useNotifications } from '../utils/notifications'

const Dashboard = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tasks, setTasks] = useState({ overdue: [], today: [], upcoming: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTasks, setFilteredTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const { requestPermission, showNotification } = useNotifications()

  useEffect(() => {
    fetchTasks()
    requestPermission()
  }, [])

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
      setTimeout(() => setMessage(''), 5000)
    }
    
    // If we have new meeting data, add the tasks to our local state
    if (location.state?.newMeeting?.tasks) {
      const newTasks = location.state.newMeeting.tasks
      setTasks(prev => {
        // Add new tasks to the appropriate category
        const updatedTasks = { ...prev }
        
        newTasks.forEach(task => {
          if (task.deadline) {
            const deadline = new Date(task.deadline)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (deadline < today) {
              updatedTasks.overdue.push(task)
            } else if (deadline.toDateString() === today.toDateString()) {
              updatedTasks.today.push(task)
            } else {
              updatedTasks.upcoming.push(task)
            }
          } else {
            // If no deadline, add to upcoming
            updatedTasks.upcoming.push(task)
          }
        })
        
        return updatedTasks
      })
      
      // Clear the location state to prevent re-adding
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/dashboard')
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchTasks = async () => {
    if (!searchQuery.trim()) {
      setFilteredTasks([])
      return
    }

    try {
      const response = await axios.get(`/api/tasks/search?q=${encodeURIComponent(searchQuery)}`)
      setFilteredTasks(response.data)
    } catch (error) {
      console.error('Error searching tasks:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(searchTasks, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => ({
      overdue: prev.overdue.map(task => task._id === updatedTask._id ? updatedTask : task),
      today: prev.today.map(task => task._id === updatedTask._id ? updatedTask : task),
      upcoming: prev.upcoming.map(task => task._id === updatedTask._id ? updatedTask : task)
    }))
    setSelectedTask(null)
  }

  const handleTaskDelete = (taskId) => {
    setTasks(prev => ({
      overdue: prev.overdue.filter(task => task._id !== taskId),
      today: prev.today.filter(task => task._id !== taskId),
      upcoming: prev.upcoming.filter(task => task._id !== taskId)
    }))
    setSelectedTask(null)
  }

  const getTotalTasks = () => {
    return tasks.overdue.length + tasks.today.length + tasks.upcoming.length
  }

  const getCompletedTasks = () => {
    return [...tasks.overdue, ...tasks.today, ...tasks.upcoming].filter(task => task.status === 'completed').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your meeting action items and tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle size={16} />
            <span>{getCompletedTasks()} completed</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock size={16} />
            <span>{getTotalTasks()} total</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-300">{message}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: CheckCircle },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {searchQuery ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Results ({filteredTasks.length})
              </h2>
              <TaskList
                tasks={filteredTasks}
                onTaskSelect={setSelectedTask}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            </div>
          ) : (
            <>
              {/* Overdue Tasks */}
              {tasks.overdue.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="text-red-500" size={20} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Overdue ({tasks.overdue.length})
                    </h2>
                  </div>
                  <TaskList
                    tasks={tasks.overdue}
                    onTaskSelect={setSelectedTask}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                </div>
              )}

              {/* Today's Tasks */}
              {tasks.today.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="text-orange-500" size={20} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Due Today ({tasks.today.length})
                    </h2>
                  </div>
                  <TaskList
                    tasks={tasks.today}
                    onTaskSelect={setSelectedTask}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                </div>
              )}

              {/* Upcoming Tasks */}
              {tasks.upcoming.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="text-blue-500" size={20} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Upcoming ({tasks.upcoming.length})
                    </h2>
                  </div>
                  <TaskList
                    tasks={tasks.upcoming}
                    onTaskSelect={setSelectedTask}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                </div>
              )}

              {getTotalTasks() === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No tasks yet
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Create your first meeting summary to get started.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <TaskCalendar
          onTaskSelect={setSelectedTask}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      )}

      {/* Task Editor Modal */}
      {selectedTask && (
        <TaskEditor
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  )
}

export default Dashboard
