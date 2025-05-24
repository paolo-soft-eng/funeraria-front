import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                <h1 className="text-2xl font-semibold mb-6">Appointments Management</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">Loading appointments...</div>
                ) : (
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
                                                {appointment.appointment_time} {/* This will now show in 12-hour format */}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {appointment.purpose}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
        ${appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'unfinished' ? 'bg-yellow-100 text-yellow-800' :
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
                                                <option value="unfinished">Unfinished</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminAppointments