import { 
    ShoppingCart, 
    MessageSquare, 
    Users, 
    Edit, 
    Calendar, 
    Activity, 
    Settings 
} from 'lucide-react';

export const useActivityUtils = () => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'Order':
                return <ShoppingCart size={16} className="text-indigo-600" />;
            case 'Message':
                return <MessageSquare size={16} className="text-blue-600" />;
            case 'Client':
                return <Users size={16} className="text-green-600" />;
            case 'Item':
                return <Edit size={16} className="text-purple-600" />;
            case 'Appointment':
                return <Calendar size={16} className="text-orange-600" />;
            case 'Payment':
                return <Activity size={16} className="text-emerald-600" />;
            case 'System':
                return <Settings size={16} className="text-gray-600" />;
            default:
                return <Activity size={16} className="text-gray-600" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'Order':
                return 'bg-indigo-50 border-indigo-200';
            case 'Message':
                return 'bg-blue-50 border-blue-200';
            case 'Client':
                return 'bg-green-50 border-green-200';
            case 'Item':
                return 'bg-purple-50 border-purple-200';
            case 'Appointment':
                return 'bg-orange-50 border-orange-200';
            case 'Payment':
                return 'bg-emerald-50 border-emerald-200';
            case 'System':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatTime12Hour = (timeString) => {
        if (!timeString) return '';

        const timeParts = timeString.split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        const formattedHours = hours.toString();
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    return {
        getActivityIcon,
        getActivityColor,
        formatTime12Hour
    };
};