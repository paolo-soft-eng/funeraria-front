import { useState, useEffect } from 'react';

const n = process.env.REACT_APP_API_URL;

export const useResponsiveView = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('card');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile, viewMode, setViewMode };
};

// Hook for appointments data management
export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${n}/api/components/adminAppointments.php`);
            const data = await response.json();

            if (data.status === 'success') {
                setAppointments(data.data);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch appointments');
            }
        } catch (err) {
            setError('Failed to fetch appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(`${n}/api/components/adminAppointments.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    status: newStatus
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                await fetchAppointments();
                return { success: true };
            } else {
                const errorMsg = data.message || 'Failed to update appointment status';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = 'Failed to update appointment status';
            setError(errorMsg);
            console.error('Error updating appointment:', err);
            return { success: false, error: errorMsg };
        }
    };

    const acceptAppointment = async (appointmentId) => {
    try {
        const response = await fetch(`${n}/api/components/adminAppointments.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'accept',
                appointment_id: appointmentId
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            await fetchAppointments();
            return { success: true };
        } else {
            const errorMsg = data.message || 'Failed to accept appointment';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    } catch (err) {
        const errorMsg = 'Failed to accept appointment';
        setError(errorMsg);
        console.error('Error accepting appointment:', err);
        return { success: false, error: errorMsg };
    }
};

    const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
        try {
            const response = await fetch(`${n}/api/components/adminAppointments.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'reschedule',
                    appointment_id: appointmentId,
                    appointment_date: newDate,
                    appointment_time: newTime
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                await fetchAppointments();
                return { success: true };
            } else {
                const errorMsg = data.message || 'Failed to reschedule appointment';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = 'Failed to reschedule appointment';
            setError(errorMsg);
            console.error('Error rescheduling appointment:', err);
            return { success: false, error: errorMsg };
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return {
        appointments,
        loading,
        error,
        setError,
        fetchAppointments,
        updateAppointmentStatus,
        acceptAppointment,
        rescheduleAppointment
    };
};

// Hook for API configuration
export const useApiConfig = () => {
    const baseUrl = `${n}/api/components`;
    
    const getImageUrl = (path) => {
        if (!path) return null;
        return `${baseUrl}/${path}`;
    };

    return { baseUrl, getImageUrl };
};