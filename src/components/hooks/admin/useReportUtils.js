import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

export const useReportUtils = () => {
  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock size={16} />, 
          color: 'text-yellow-600 bg-yellow-100', 
          label: 'Pending' 
        };
      case 'resolved':
        return { 
          icon: <CheckCircle size={16} />, 
          color: 'text-green-600 bg-green-100', 
          label: 'Resolved' 
        };
      case 'rejected':
        return { 
          icon: <XCircle size={16} />, 
          color: 'text-red-600 bg-red-100', 
          label: 'Rejected' 
        };
      default:
        return { 
          icon: <AlertCircle size={16} />, 
          color: 'text-gray-600 bg-gray-100', 
          label: 'Unknown' 
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    getStatusInfo,
    formatDate
  };
};