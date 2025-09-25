import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Calendar,
  FileText,
  Heart,
  HelpCircle,
  Mail,
  Smartphone,
  MapPin,
  Bug,
  ChevronRight,
  Settings as SettingsIcon,
  Save
} from 'lucide-react';

// Import all custom hooks
import {
  useAuth,
  useUserData,
  useProfileForm,
  usePassword,
  useProfilePicture,
  useAppointments,
  useDocuments,
  useBugReport,
  useNotification
} from '../hooks/client/useClientProfile';
import { EmailContext } from '../utils/EmailContext';

const ClientProfile = () => {
  const { email } = React.useContext(EmailContext);
  const [activeTab, setActiveTab] = useState('profile');

  // Authentication
  const { isLoggedIn, userId, authError } = useAuth();

  // User data management
  const { userData, loading, error, refetch } = useUserData(email);

  // Profile form management
  const { formData, handleInputChange, handleSubmit } = useProfileForm(userData);

  // Password management
  const {
    passwordData,
    passwordError,
    handlePasswordChange,
    handlePasswordSubmit,
    resetPasswordData
  } = usePassword(userData);

  // Profile picture management
  const {
    handleProfilePicture,
    handleProfilePictureUpload,
    handleDeleteProfilePicture
  } = useProfilePicture(userData);

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

  // Documents management
  const {
    documents,
    documentDetails,
    setDocumentDetails,
    loadDocuments,
    handleDocumentUpload,
    handleDeleteDocument
  } = useDocuments(userData);

  // Bug report management
  const {
    bugDescription,
    setBugDescription,
    isBugSubmitting,
    bugReportStatus,
    setBugReportStatus,
    handleReportBug,
    resetBugReport
  } = useBugReport(userData, email);

  // Notification management
  const { message, showMessage, clearMessage } = useNotification();

  // Modal states (these remain as local state since they're UI-specific)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'report bug', label: 'Report Bug', icon: <Bug size={18} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
  ];

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'appointments' && userData?.id) {
      loadAppointments();
    }
    if (activeTab === 'documents' && userData?.id) {
      loadDocuments();
    }
  }, [activeTab, userData?.id, loadAppointments, loadDocuments]);

  // Enhanced handlers that use hooks and show messages
  const handleProfileSubmit = async (e) => {
    try {
      const result = await handleSubmit(e);
      if (result.status === 'success') {
        showMessage('Profile updated successfully!', 'success');
      } else {
        showMessage(result.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  };

  const handlePasswordSubmitWithMessage = async (e) => {
    try {
      const result = await handlePasswordSubmit(e);
      if (result.status === 'success') {
        setIsResetModalOpen(false);
        resetPasswordData();
        showMessage('Password changed successfully!', 'success');
      } else {
        // Error is handled by the hook itself
      }
    } catch (err) {
      showMessage('Failed to change password. Please try again.', 'error');
    }
  };

  const handleProfilePictureUploadWithMessage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await handleProfilePictureUpload(file);
        if (result.status === 'success' && result.image_path) {
          // Update userData with new profile picture
          refetch(); // Refresh user data
          showMessage('Profile picture updated successfully!', 'success');
        } else {
          showMessage(result.message || 'Failed to upload profile picture', 'error');
        }
      } catch (err) {
        showMessage('Failed to upload profile picture. Please try again.', 'error');
      }
    }
  };

  const handleDeleteProfilePictureWithMessage = async () => {
    if (window.confirm("Are you sure you want to delete your profile picture?")) {
      try {
        const result = await handleDeleteProfilePicture();
        if (result.status === 'success') {
          refetch(); // Refresh user data
          showMessage('Profile picture deleted successfully!', 'success');
        } else {
          showMessage(result.message || 'Failed to delete profile picture', 'error');
        }
      } catch (err) {
        showMessage('Failed to delete profile picture. Please try again.', 'error');
      }
    }
  };

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

  const handleDocumentUploadWithMessage = async (e) => {
    e.preventDefault();
    if (!documentFile || !documentDetails.documentName || !documentDetails.documentType) {
      showMessage('All fields are required, including the file', 'error');
      return;
    }

    try {
      const result = await handleDocumentUpload(documentFile, documentDetails);
      if (result.status === 'success') {
        showMessage('Document uploaded successfully!', 'success');
        setIsDocumentModalOpen(false);
        setDocumentFile(null);
        setDocumentDetails({ documentName: '', documentType: '' });
        loadDocuments();
      } else {
        showMessage(result.message || 'Failed to upload document', 'error');
      }
    } catch (err) {
      showMessage('Failed to upload document. Please try again.', 'error');
    }
  };

  const handleDeleteDocumentWithMessage = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const result = await handleDeleteDocument(documentId);
        if (result.status === 'success') {
          showMessage('Document deleted successfully', 'success');
          loadDocuments();
        } else {
          showMessage(result.message || 'Failed to delete document', 'error');
        }
      } catch (err) {
        showMessage('Failed to delete document. Please try again.', 'error');
      }
    }
  };

  const handleReportBugWithMessage = async (e) => {
    try {
      const result = await handleReportBug(e);
      if (result.status === 'success') {
        setBugReportStatus({ type: 'success', message: result.message });
        setBugDescription('');
      } else {
        setBugReportStatus({ type: 'error', message: result.message });
      }
    } catch (err) {
      setBugReportStatus({ type: 'error', message: 'Failed to submit bug report. Please try again.' });
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
                href="/auth"
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
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading your profile...</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
        <p className="text-gray-600">Manage your funeral arrangement preferences and personal information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight size={16} className="ml-auto" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex-1 p-8 bg-gray-100">
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

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-center mb-6">
                      <div className="relative group mb-4 sm:mb-0 sm:mr-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {userData.profile_picture && (
                            <img
                              src={handleProfilePicture(userData.profile_picture)}
                              alt="Profile"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          )}
                          <User
                            size={32}
                            className={`text-blue-600 ${userData.profile_picture ? 'hidden' : 'block'}`}
                          />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-30 rounded-full cursor-pointer transition-opacity">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureUploadWithMessage}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-3">Upload a clear photo of yourself</p>
                        {userData.profile_picture && (
                          <button
                            onClick={handleDeleteProfilePictureWithMessage}
                            className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 w-full sm:w-auto transition-colors"
                          >
                            Delete Picture
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <Smartphone size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <MapPin size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Name and phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmitWithMessage}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      minLength="8"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      <p className={passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        ✓ At least 8 characters
                      </p>
                      <p className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                        ✓ Contains at least one number
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{passwordError}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
                      <Save size={16} className="mr-2" />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Important Documents</h2>
                <button
                  onClick={() => setIsDocumentModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mb-6"
                >
                  Upload Document
                </button>

                {documents.length === 0 ? (
                  <p className="text-gray-600">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex justify-between items-center border p-4 rounded-lg">
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-gray-600">{doc.document_type}</p>
                          <a
                            href={`http://localhost/apii/components/documents.php?file=${doc.document_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Document
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteDocumentWithMessage(doc.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Document Upload Modal */}
                {isDocumentModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                      <h3 className="text-lg font-medium mb-4">Upload New Document</h3>
                      <form onSubmit={handleDocumentUploadWithMessage}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                          <input
                            type="text"
                            value={documentDetails.documentName}
                            onChange={(e) => setDocumentDetails({ ...documentDetails, documentName: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                          <input
                            type="text"
                            value={documentDetails.documentType}
                            onChange={(e) => setDocumentDetails({ ...documentDetails, documentType: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                          <input
                            type="file"
                            onChange={(e) => setDocumentFile(e.target.files[0])}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsDocumentModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Upload
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
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
            )}

            {/* Bug Report Tab */}
            {activeTab === 'report bug' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Report a Bug</h2>
                <form onSubmit={handleReportBugWithMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Describe the issue (English, Tagalog, Bisaya)
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={5}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      required
                      placeholder="Please describe the bug you encountered..."
                    />
                  </div>
                  {bugReportStatus && (
                    <div className={`p-3 rounded ${bugReportStatus.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'}`}>
                      {bugReportStatus.message}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      disabled={isBugSubmitting}
                    >
                      {isBugSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Help & Support</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Contact Our Funeral Directors</h3>
                  <p className="text-gray-600 mb-4">
                    Our compassionate staff is available 24/7 to assist you with any questions about funeral arrangements or this system.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium">Funeraria Gomez Support Team</p>
                    <p className="text-blue-600">support@funerariagomez.com</p>
                    <p className="text-blue-600">(555) 987-6543</p>
                    <p className="text-sm text-gray-500 mt-2">Available 24 hours</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">How do I update my funeral preferences?</h4>
                      <p className="text-gray-600">
                        You can update your preferences at any time in the "Preferences" section of your profile.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">What documents should I upload?</h4>
                      <p className="text-gray-600">
                        We recommend uploading your will, life insurance policy, and any pre-arrangement documents to help your family when the time comes.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">How do I schedule an appointment?</h4>
                      <p className="text-gray-600">
                        You can schedule an appointment in the "Appointments" section or by calling our funeral home directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;