import React, { useState, useEffect, useContext } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useAuth, useUserData, useAppointments, useNotification } from '../../hooks/client/useClientProfile';
import { EmailContext } from '../../utils/EmailContext';

const ClientAppointments = () => {
  const { email } = useContext(EmailContext);

  const { isLoggedIn, authError } = useAuth();
  const { userData, loading, error } = useUserData(email);
  const {
    appointments,
    appointmentData,
    setAppointmentData,
    rescheduleData,
    setRescheduleData,
    loadAppointments,
    handleCreateAppointment,
    handleRescheduleAppointment,
    handleCancelAppointment,
    handleDeleteAppointment
  } = useAppointments(userData);
  const { message, showMessage, clearMessage } = useNotification();

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // New state for custom modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToAction, setAppointmentToAction] = useState(null);

  useEffect(() => {
    if (userData?.id) {
      loadAppointments();
    }
  }, [userData?.id, loadAppointments]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateSubmit = async () => {
    try {
      const result = await handleCreateAppointment(appointmentData);
      if (result.status === 'success') {
        showMessage('Appointment scheduled successfully!', 'success');
        setIsAppointmentModalOpen(false);
        setAppointmentData({ date: '', time: '', purpose: '' });
        loadAppointments();
      } else {
        showMessage(result.message || 'Failed to schedule appointment', 'error');
      }
    } catch (err) {
      showMessage('Failed to schedule appointment. Please try again.', 'error');
    }
  };

  const handleRescheduleSubmit = async () => {
    try {
      const result = await handleRescheduleAppointment(selectedAppointment.id, rescheduleData);
      if (result.status === 'success') {
        showMessage('Appointment rescheduled successfully!', 'success');
        setIsRescheduleModalOpen(false);
        setRescheduleData({ date: '', time: '' });
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        showMessage(result.message || 'Failed to reschedule appointment', 'error');
      }
    } catch (err) {
      showMessage('Failed to reschedule appointment. Please try again.', 'error');
    }
  };

  // Open cancel modal
  const openCancelModal = (appointment) => {
    setAppointmentToAction(appointment);
    setIsCancelModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (appointment) => {
    setAppointmentToAction(appointment);
    setIsDeleteModalOpen(true);
  };

  // Handle cancel appointment with custom modal
  const handleCancelAppointmentWithMessage = async () => {
    if (!appointmentToAction) return;

    try {
      const result = await handleCancelAppointment(appointmentToAction.id);
      if (result.status === 'success') {
        showMessage('Appointment cancelled successfully', 'success');
        loadAppointments();
      } else {
        showMessage(result.message || 'Failed to cancel appointment', 'error');
      }
    } catch (err) {
      showMessage('Failed to cancel appointment. Please try again.', 'error');
    } finally {
      setIsCancelModalOpen(false);
      setAppointmentToAction(null);
    }
  };

  // Handle delete appointment with custom modal
  const handleDeleteAppointmentWithMessage = async () => {
    if (!appointmentToAction) return;

    try {
      const result = await handleDeleteAppointment(appointmentToAction.id);
      if (result.status === 'success') {
        showMessage('Appointment deleted successfully', 'success');
        loadAppointments();
      } else {
        showMessage(result.message || 'Failed to delete appointment', 'error');
      }
    } catch (err) {
      showMessage('Failed to delete appointment. Please try again.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setAppointmentToAction(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✓';
      case 'scheduled':
        return '📅';
      case 'finished':
        return '✅';
      case 'cancelled':
        return '✕';
      default:
        return '●';
    }
  };
  const canRescheduleOrCancel = (status) => {
    return status === 'pending' || status === 'accepted';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
            <p className="mt-2 text-gray-600">{authError}</p>
            <div className="mt-6">
              <a href="/gomez/auth" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen p-6 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="mt-1 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">No User Found</h3>
              <p className="mt-1 text-yellow-700">No user data found for email: {email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className='flex justify-center text-3xl p-2 font-bold text-gray-600'>Appointment Calendar</h1>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'}`}>
              <div className="flex items-center">
                <svg className={`h-5 w-5 mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="inline h-4 w-4 mr-1" />
                List
              </button>
            </div>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-500 flex items-center"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Schedule Appointment
            </button>
          </div>

          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-400 text-white p-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="text-center">
                    <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
                  </div>

                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex justify-center mt-2">
                  <button
                    onClick={goToToday}
                    className="px-4 py-1 bg-gray-500 hover:bg-gray-600 rounded text-sm font-medium transition"
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2 border-b border-r border-gray-200 bg-gray-50 min-h-24"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const date = new Date(year, month, day);
                  const dayAppointments = getAppointmentsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      className={`p-2 border-b border-r border-gray-200 min-h-24 ${isToday ? 'bg-blue-100' : 'bg-white'} hover:bg-gray-50 transition`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                        {day}
                      </div>

                      <div className="space-y-1">
                        {dayAppointments.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              if (canRescheduleOrCancel(apt.status)) {
                                setIsRescheduleModalOpen(true);
                              }
                            }}
                            className={`text-xs p-1 rounded ${canRescheduleOrCancel(apt.status) ? 'cursor-pointer' : 'cursor-default'} ${getStatusColor(apt.status)} ${canRescheduleOrCancel(apt.status) ? 'hover:opacity-80' : ''}`}
                          >
                            <div className="font-medium truncate flex items-center gap-1">
                              <span>{getStatusIcon(apt.status)}</span>
                              {apt.appointment_time}
                            </div>
                            <div className="truncate">{apt.purpose}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Appointments</h2>

              {appointments.length === 0 ? (
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">Schedule an appointment to discuss your arrangements.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{appointment.purpose}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.appointment_time}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            <span>{getStatusIcon(appointment.status)}</span>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {appointment.status === 'accepted' && (
                            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Your appointment has been confirmed by the admin
                            </p>
                          )}
                          {appointment.status === 'pending' && (
                            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              <span>Your appointment is pending admin approval</span>
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {canRescheduleOrCancel(appointment.status) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50 rounded border border-green-600 transition"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => openCancelModal(appointment)}
                                className="px-3 py-1 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded border border-yellow-600 transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDeleteModal(appointment)}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedule Appointment Modal */}
          {isAppointmentModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Schedule New Appointment</h3>
                  <button
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <select
                      value={appointmentData.purpose}
                      onChange={(e) => setAppointmentData({ ...appointmentData, purpose: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a purpose</option>
                      <option value="Pre-arrangement consultation">Pre-arrangement consultation</option>
                      <option value="Funeral planning">Funeral planning</option>
                      <option value="Document submission">Document submission</option>
                      <option value="Payment discussion">Payment discussion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </div>
            </div>
          )}

          {isRescheduleModalOpen && selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Reschedule Appointment</h3>
                  <button
                    onClick={() => {
                      setIsRescheduleModalOpen(false);
                      setSelectedAppointment(null);
                      setRescheduleData({ date: '', time: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Current appointment details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Current Appointment:</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.purpose}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {selectedAppointment.appointment_time}
                  </p>
                </div>

                {/* New date and time inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Info message */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>Rescheduled appointments will need admin approval</span>
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsRescheduleModalOpen(false);
                      setSelectedAppointment(null);
                      setRescheduleData({ date: '', time: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleSubmit}
                    disabled={!rescheduleData.date || !rescheduleData.time}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Appointment Modal */}
          {isCancelModalOpen && appointmentToAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Appointment</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to cancel this appointment? This action can be undone by rescheduling.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="font-medium text-gray-900">{appointmentToAction.purpose}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(appointmentToAction.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {appointmentToAction.appointment_time}
                    </p>
                    {appointmentToAction.status === 'accepted' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <Info className="h-3 w-3" />
                        <span>This appointment was accepted by the admin</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsCancelModalOpen(false);
                      setAppointmentToAction(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleCancelAppointmentWithMessage}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition flex items-center"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Appointment Modal */}
          {isDeleteModalOpen && appointmentToAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Appointment</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to permanently delete this appointment? This action cannot be undone.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                    <p className="font-medium text-gray-900">{appointmentToAction.purpose}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(appointmentToAction.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {appointmentToAction.appointment_time}
                    </p>
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ This action is permanent and cannot be reversed
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setAppointmentToAction(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleDeleteAppointmentWithMessage}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientAppointments;