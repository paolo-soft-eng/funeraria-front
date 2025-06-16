import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { FaTable, FaThLarge } from 'react-icons/fa'

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost/apii/components/adminAppointments.php');
            const data = await response.json();

            if (data.status === 'success') {
                setAppointments(data.data);
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

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await fetch('http://localhost/apii/components/adminAppointments.php', {
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
            console.log(response);
            
            console.log(data);
            
            if (data.status === 'success') {
                fetchAppointments(); // Refresh the list
            } else {
                setError(data.message || 'Failed to update appointment status');
            }
        } catch (err) {
            setError('Failed to update appointment status');
            console.error('Error updating appointment:', err);
        }
    };

    return (
        <AdminLayout currentPage='appointments'>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Appointments Management</h1>
                    {!isMobile && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                <FaTable className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                <FaThLarge className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">Loading appointments...</div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{appointment.user_name}</div>
                                            <div className="text-sm text-gray-500">{appointment.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(appointment.appointment_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.appointment_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {appointment.purpose}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={appointment.status}
                                                onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="finished">Finished</option>
                                                <option value="scheduled">Scheduled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{appointment.user_name}</h3>
                                        <p className="text-sm text-gray-500">{appointment.user_email}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                        ${appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span>{appointment.appointment_time}</span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Purpose:</span> {appointment.purpose}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <select
                                        value={appointment.status}
                                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    >
                                        <option value="finished">Finished</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminAppointments