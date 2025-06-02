export const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'finished': return 'bg-gray-500'
      case 'not_started': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
}
  
export const getStatusText = (status: string): string => {
    switch (status) {
      case 'running': return 'LIVE'
      case 'finished': return 'FINISHED'
      case 'not_started': return 'UPCOMING'
      default: return 'TBD'
    }
}
  
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
}
