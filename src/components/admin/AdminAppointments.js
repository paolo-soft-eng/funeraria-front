import React from 'react';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaUser } from 'react-icons/fa';
import { useResponsiveView, useAppointments, useApiConfig } from '../hooks/admin/useAppointments';

const AdminAppointments = () => {
    const { isMobile, viewMode, setViewMode } = useResponsiveView();
    const { appointments, loading, error, setError, updateAppointmentStatus } = useAppointments();
    const { getImageUrl } = useApiConfig();

    const handleStatusChange = async (appointmentId, newStatus) => {
        const result = await updateAppointmentStatus(appointmentId, newStatus);
        if (!result.success) {
            // Error is already set by the hook
            console.error('Failed to update status:', result.error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'finished':
                return 'bg-green-100 text-green-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const UserAvatar = ({ profilePicture, userName, size = 'md' }) => {
        const sizeClasses = {
            sm: 'h-10 w-10',
            md: 'h-12 w-12'
        };

        return (
            <div className={`flex-shrink-0 ${sizeClasses[size]}`}>
                {profilePicture ? (
                    <img
                        className={`${sizeClasses[size]} rounded-full object-cover`}
                        src={getImageUrl(profilePicture)}
                        alt={userName}
                    />
                ) : (
                    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
                        <FaUser className={`text-gray-400 ${size === 'md' ? 'text-xl' : ''}`} />
                    </div>
                )}
            </div>
        );
    };

    const StatusBadge = ({ status }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
            {status}
        </span>
    );

    const StatusSelect = ({ appointmentId, currentStatus, className = '' }) => (
        <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(appointmentId, e.target.value)}
            className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${className}`}
        >
            <option value="finished">Finished</option>
            <option value="scheduled">Scheduled</option>
        </select>
    );

    const TableView = () => (
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
                                <div className="flex items-center">
                                    <UserAvatar 
                                        profilePicture={appointment.profile_picture}
                                        userName={appointment.user_name}
                                        size="sm"
                                    />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{appointment.user_name}</div>
                                        <div className="text-sm text-gray-500">{appointment.user_email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatDate(appointment.appointment_date)}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {appointment.purpose}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={appointment.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <StatusSelect 
                                    appointmentId={appointment.id}
                                    currentStatus={appointment.status}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const CardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                        <UserAvatar 
                            profilePicture={appointment.profile_picture}
                            userName={appointment.user_name}
                            size="md"
                        />
                        <div className="ml-4 flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{appointment.user_name}</h3>
                            <p className="text-sm text-gray-500 truncate">{appointment.user_email}</p>
                        </div>
                        <StatusBadge status={appointment.status} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span>{formatDate(appointment.appointment_date)}</span>
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
                        <StatusSelect 
                            appointmentId={appointment.id}
                            currentStatus={appointment.status}
                            className="w-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

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
                    <div className="text-center py-4 text-sm text-gray-600">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm italic">
                        No appointments yet
                    </div>
                ) : (
                    viewMode === 'table' ? <TableView /> : <CardView />
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAppointments;