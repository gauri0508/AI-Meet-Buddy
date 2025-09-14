import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import api from '../utils/api'

const TaskCalendar = ({ onTaskSelect, onTaskUpdate, onTaskDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [currentDate])

  const fetchTasks = async () => {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const response = await api.get(`/tasks/calendar?month=${month}&year=${year}`)
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching calendar tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.deadline && isSameDay(new Date(task.deadline), date)
    )
  }

  const getTaskPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleTaskClick = (task) => {
    onTaskSelect(task)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                  isCurrentMonth 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-900'
                } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                } ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => handleTaskClick(task)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                        task.status === 'completed' 
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}
                      title={task.task}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getTaskPriorityColor(task.priority)}`}></div>
                        <span className="truncate">{task.task}</span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCalendar
