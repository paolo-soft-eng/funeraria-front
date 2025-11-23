import React, { useState } from 'react';

import AdminLayout from './AdminLayout';
import { 
    FaTable, 
    FaThLarge, 
    FaUser, 
    FaCalendarAlt, 
    FaClock, 
    FaEnvelope, 
    FaChevronLeft, 
    FaChevronRight 
} from 'react-icons/fa';
import { useResponsiveView, useAppointments, useApiConfig } from '../../hooks/admin/useAppointments';
import { usePagination } from '../../hooks/admin/usePagination';

const AdminAppointments = () => {
    const { isMobile, viewMode, setViewMode } = useResponsiveView();
    const { appointments, loading, error, setError, updateAppointmentStatus } = useAppointments();
    const { getImageUrl } = useApiConfig();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Initialize pagination hook
    const {
        totalPages,
        handlePageChange,
        handleItemsPerPageChange,
        getVisiblePageNumbers,
    } = usePagination(
        appointments.length,
        itemsPerPage,
        currentPage,
        setCurrentPage,
        setItemsPerPage
    );

    // Paginate data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, startIndex + itemsPerPage);

    const handleStatusChange = async (appointmentId, newStatus) => {
        const result = await updateAppointmentStatus(appointmentId, newStatus);
        if (!result.success) {
            console.error('Failed to update status:', result.error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'finished':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'scheduled':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'finished':
                return '✓';
            case 'scheduled':
                return '○';
            default:
                return '●';
        }
    };

    const UserAvatar = ({ profilePicture, userName, size = 'md' }) => {
        const sizeClasses = {
            sm: 'h-11 w-11',
            md: 'h-14 w-14'
        };

        return (
            <div className={`flex-shrink-0 ${sizeClasses[size]} relative`}>
                {profilePicture ? (
                    <img
                        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
                        src={getImageUrl(profilePicture)}
                        alt={userName}
                    />
                ) : (
                    <div className={`${sizeClasses[size]} rounded-full bg-gray-400 flex items-center justify-center ring-2 ring-white shadow-sm`}>
                        <FaUser className={`text-white ${size === 'md' ? 'text-xl' : 'text-lg'}`} />
                    </div>
                )}
            </div>
        );
    };

    const StatusBadge = ({ status }) => (
        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
            <span className="font-semibold">{getStatusIcon(status)}</span>
            {status}
        </span>
    );

    const StatusSelect = ({ appointmentId, currentStatus, className = '' }) => (
        <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(appointmentId, e.target.value)}
            className={`rounded-lg border-gray-300 shadow-sm text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 ${className}`}
        >
            <option value="finished">Finished</option>
            <option value="scheduled">Scheduled</option>
        </select>
    );

    const TableView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <UserAvatar 
                                            profilePicture={appointment.profile_picture}
                                            userName={appointment.user_name}
                                            size="sm"
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{appointment.user_name}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <FaEnvelope className="w-3 h-3" />
                                                {appointment.user_email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                        <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400" />
                                        {formatDate(appointment.appointment_date)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                        <FaClock className="w-3.5 h-3.5 text-gray-400" />
                                        {appointment.appointment_time}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-700">{appointment.purpose}</span>
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
        </div>
    );

    const CardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start mb-5">
                        <UserAvatar 
                            profilePicture={appointment.profile_picture}
                            userName={appointment.user_name}
                            size="md"
                        />
                        <div className="ml-4 flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{appointment.user_name}</h3>
                            <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                                <FaEnvelope className="w-3 h-3" />
                                {appointment.user_email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                                Date
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</span>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <FaClock className="w-4 h-4 text-gray-500" />
                                Time
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{appointment.appointment_time}</span>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-indigo-900">Purpose:</span>
                                <span className="ml-2">{appointment.purpose}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <StatusBadge status={appointment.status} />
                        <StatusSelect 
                            appointmentId={appointment.id}
                            currentStatus={appointment.status}
                            className="text-xs"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <AdminLayout currentPage='appointments'>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Appointments</h1>
                        <p className="text-base text-gray-600 font-medium">Manage and track all client appointments</p>
                    </div>
                    {!isMobile && (
                        <div className="flex gap-2 bg-white rounded-xl shadow-md p-1.5 border border-gray-200">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-3 rounded-lg transition-all duration-200 ${
                                    viewMode === 'table' 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Table View"
                            >
                                <FaTable className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-3 rounded-lg transition-all duration-200 ${
                                    viewMode === 'card' 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Card View"
                            >
                                <FaThLarge className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-lg mb-6 shadow-sm">
                        <div className="flex items-center">
                            <span className="font-semibold mr-2">Error:</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-sm text-gray-600 font-medium">Loading appointments...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                        <p className="text-sm text-gray-500">Appointments will appear here once clients book them</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? <TableView /> : <CardView />}

                        {/* Pagination Section */}
                        {appointments.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                {/* Items per page */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 font-medium">Items per page:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-indigo-200"
                                    >
                                        {[5, 10, 20, 50].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Page navigation */}
                                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <FaChevronLeft className="w-3 h-3" />
                                    </button>

                                    {getVisiblePageNumbers().map((page, i) => (
                                        <button
                                            key={i}
                                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                                            disabled={page === '...'}
                                            className={`px-3 py-1 text-sm rounded-md border ${
                                                page === currentPage
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                            } ${page === '...' ? 'cursor-default opacity-60' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <FaChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAppointments;
