import { format, isToday, isPast, isFuture, isSameDay, addDays, subDays } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return 'No date'
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return 'No date'
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const getDateStatus = (deadline) => {
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

export const isOverdue = (deadline) => {
  if (!deadline) return false
  const date = new Date(deadline)
  return isPast(date) && !isToday(date)
}

export const isDueToday = (deadline) => {
  if (!deadline) return false
  return isToday(new Date(deadline))
}

export const isUpcoming = (deadline) => {
  if (!deadline) return false
  return isFuture(new Date(deadline))
}

export const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return null
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const getRelativeDate = (deadline) => {
  if (!deadline) return 'No deadline'
  
  const days = getDaysUntilDeadline(deadline)
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `In ${days} days`
  if (days < 0) return `${Math.abs(days)} days ago`
  
  return formatDate(deadline)
}
