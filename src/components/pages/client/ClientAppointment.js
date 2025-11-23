import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Save } from 'lucide-react';
import { useAuth, useUserData, useAppointments, useNotification } from '../../hooks/client/useClientProfile';
import { EmailContext } from '../../utils/EmailContext';

const ClientAppointments = () => {
  const { email } = React.useContext(EmailContext);
  
  // Authentication
  const { isLoggedIn, authError } = useAuth();

  // User data management
  const { userData, loading, error } = useUserData(email);

  // Appointments management
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

  // Notification management
  const { message, showMessage, clearMessage } = useNotification();

  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Load appointments when component mounts
  useEffect(() => {
    if (userData?.id) {
      loadAppointments();
    }
  }, [userData?.id, loadAppointments]);

  // Enhanced handlers that use hooks and show messages
  const handleCreateAppointmentWithMessage = async (e) => {
    e.preventDefault();
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

  const handleRescheduleAppointmentWithMessage = async (e) => {
    e.preventDefault();
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

  const handleCancelAppointmentWithMessage = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const result = await handleCancelAppointment(appointmentId);
        if (result.status === 'success') {
          showMessage('Appointment cancelled successfully', 'success');
          loadAppointments();
        } else {
          showMessage(result.message || 'Failed to cancel appointment', 'error');
        }
      } catch (err) {
        showMessage('Failed to cancel appointment. Please try again.', 'error');
      }
    }
  };

  const handleDeleteAppointmentWithMessage = async (appointmentId) => {
    if (window.confirm("Are you sure you want to permanently delete this appointment? This action cannot be undone.")) {
      try {
        const result = await handleDeleteAppointment(appointmentId);
        if (result.status === 'success') {
          showMessage('Appointment deleted successfully', 'success');
          loadAppointments();
        } else {
          showMessage(result.message || 'Failed to delete appointment', 'error');
        }
      } catch (err) {
        showMessage('Failed to delete appointment. Please try again.', 'error');
      }
    }
  };

  // Early returns for different states
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
              <a
                href="/gomez/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Appointments</h1>
        <p className="text-gray-600">Schedule and manage your funeral arrangement appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 bg-gray-100">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
              }`}>
              <div className="flex items-center">
                <svg className={`h-5 w-5 mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Schedule Appointment
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                <p className="mt-1 text-sm text-gray-500">Schedule an appointment to discuss your arrangements.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{appointment.purpose}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'unfinished' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsRescheduleModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-500 text-sm font-medium"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointmentWithMessage(appointment.id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteAppointmentWithMessage(appointment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Appointment Creation Modal */}
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

                <form onSubmit={handleCreateAppointmentWithMessage}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={appointmentData.date}
                        onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={appointmentData.time}
                        onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <select
                        value={appointmentData.purpose}
                        onChange={(e) => setAppointmentData({ ...appointmentData, purpose: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
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
                      type="button"
                      onClick={() => setIsAppointmentModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Schedule Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
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
                <form onSubmit={handleRescheduleAppointmentWithMessage}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                      <input
                        type="date"
                        value={rescheduleData.date}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                      <input
                        type="time"
                        value={rescheduleData.time}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
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
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Reschedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientAppointments;