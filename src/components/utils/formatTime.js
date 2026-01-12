// utils/formatTime.js
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // If within 24 hours, show relative time
  if (diffMs <= 24 * 60 * 60 * 1000 && diffMs > 0) {
    if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      return 'soon';
    }
  }
  
  // Otherwise show full date
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getTimeUntilAvailable = (occupiedUntil) => {
  if (!occupiedUntil) return 'Unknown';
  
  const now = new Date();
  const availableDate = new Date(occupiedUntil);
  
  if (availableDate <= now) return 'Now';
  
  const diffMs = availableDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else {
    return 'Less than an hour';
  }
};

export const isChapelAvailableNow = (chapel) => {
  if (!chapel.is_occupied) return true;
  
  if (chapel.occupied_until) {
    const now = new Date();
    const occupiedUntil = new Date(chapel.occupied_until);
    return now >= occupiedUntil;
  }
  
  return false;
};