import React from 'react'
import { Calendar, User, Flag, CheckCircle, Circle, Trash2, Edit } from 'lucide-react'
import { format, isToday, isPast, isFuture } from 'date-fns'

const TaskList = ({ tasks, onTaskSelect, onTaskUpdate, onTaskDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getDateStatus = (deadline) => {
    if (!deadline) return { status: 'none', color: 'text-gray-500 dark:text-gray-400' }
    
    const date = new Date(deadline)
    if (isPast(date) && !isToday(date)) {
      return { status: 'overdue', color: 'text-red-600 dark:text-red-400' }
    } else if (isToday(date)) {
      return { status: 'today', color: 'text-orange-600 dark:text-orange-400' }
    } else if (isFuture(date)) {
      return { status: 'upcoming', color: 'text-blue-600 dark:text-blue-400' }
    }
    return { status: 'none', color: 'text-gray-500 dark:text-gray-400' }
  }

  const handleStatusToggle = async (task) => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed'
      }
      onTaskUpdate(updatedTask)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDelete = async (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onTaskDelete(task._id)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No tasks found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const dateStatus = getDateStatus(task.deadline)
        
        return (
          <div
            key={task._id}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Status Toggle */}
              <button
                onClick={() => handleStatusToggle(task)}
                className="mt-1 text-gray-400 hover:text-green-500 transition-colors"
              >
                {task.status === 'completed' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      task.status === 'completed' 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.task}
                    </h3>
                    
                    {/* Task Meta */}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {/* Assignee */}
                      {task.assignee && task.assignee !== 'Not specified' && (
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{task.assignee}</span>
                        </div>
                      )}

                      {/* Deadline */}
                      {task.deadline && (
                        <div className={`flex items-center space-x-1 ${dateStatus.color}`}>
                          <Calendar size={12} />
                          <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                        </div>
                      )}

                      {/* Priority */}
                      <div className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                        <Flag size={12} />
                        <span className="capitalize">{task.priority}</span>
                        <span>{getPriorityIcon(task.priority)}</span>
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onTaskSelect(task)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList
