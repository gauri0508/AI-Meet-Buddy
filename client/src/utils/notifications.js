import { useEffect } from 'react'

export const useNotifications = () => {
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
  }

  return { requestPermission, showNotification }
}

export const useTaskNotifications = (tasks) => {
  const { showNotification } = useNotifications()

  useEffect(() => {
    const checkDueTasks = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dueToday = tasks.filter(task => {
        if (!task.deadline || task.status === 'completed') return false
        
        const taskDate = new Date(task.deadline)
        taskDate.setHours(0, 0, 0, 0)
        
        return taskDate.getTime() === today.getTime()
      })

      dueToday.forEach(task => {
        showNotification(
          '🔔 Task Due Today!',
          {
            body: `"${task.task}" is due today`,
            tag: `task-${task._id}`,
            requireInteraction: true
          }
        )
      })
    }

    // Check for due tasks every hour
    const interval = setInterval(checkDueTasks, 60 * 60 * 1000)
    
    // Initial check
    checkDueTasks()

    return () => clearInterval(interval)
  }, [tasks, showNotification])
}
