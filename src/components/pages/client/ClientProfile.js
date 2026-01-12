import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  FileText,
  HelpCircle,
  Mail,
  AlertCircle,
  Smartphone,
  MapPin,
  Bug,
  ChevronRight,
  Save,
  AlertTriangle
} from 'lucide-react';

import {
  useAuth,
  useUserData,
  useProfileForm,
  usePassword,
  useProfilePicture,
  useDocuments,
  useBugReport,
  useNotification
} from '../../hooks/client/useClientProfile';
import { EmailContext } from '../../utils/EmailContext';

const ClientProfile = () => {
  const { email } = React.useContext(EmailContext);
  const [activeTab, setActiveTab] = useState('profile');
  const n = process.env.REACT_APP_API_URL;
  const [validationErrors, setValidationErrors] = useState({});

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

  // Modal states
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  // Custom confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning' // 'warning', 'danger', 'info'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'report bug', label: 'Report Bug', icon: <Bug size={18} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
  ];

  // Show confirmation modal
  const showConfirmation = (title, message, onConfirm, options = {}) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'warning'
    });
  };

  const runValidation = (data) => {
    const errors = {};
    const nameRegex = /^[A-Za-zñÑ\s.'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^9\d{9}$/;

    // First Name
    if (!data.firstName || !data.firstName.trim()) {
      errors.firstName = 'First Name is required.';
    } else if (!nameRegex.test(data.firstName)) {
      errors.firstName = 'Name can only contain letters, spaces, periods, apostrophes, and hyphens.';
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    // Last Name
    if (!data.lastName || !data.lastName.trim()) {
      errors.lastName = 'Last Name is required.';
    } else if (!nameRegex.test(data.lastName)) {
      errors.lastName = 'Name can only contain letters, spaces, periods, apostrophes, and hyphens.';
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

    // Email Address
    if (!data.email || !data.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Phone Number
    const cleanedPhone = data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '';
    if (!cleanedPhone) {
      errors.phone = 'Phone number is required.';
    } else if (cleanedPhone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    } else if (!phoneRegex.test(cleanedPhone)) {
      errors.phone = 'Phone number must start with 9 (e.g., 9123456789).';
    }

    // Address
    if (!data.address || !data.address.trim()) {
      errors.address = 'Address is required.';
    } else if (data.address.trim().length < 10) {
      errors.address = 'Please provide a complete address (at least 10 characters).';
    }

    // Emergency Contact
    if (!data.emergencyContact || !data.emergencyContact.trim()) {
      errors.emergencyContact = 'Emergency Contact is required.';
    } else if (data.emergencyContact.trim().length < 5) {
      errors.emergencyContact = 'Please provide complete emergency contact information.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // **ENHANCED INPUT CHANGE HANDLER**
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data via hook
    handleInputChange(e);

    // Clear the specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  // Update the handleProfileSubmit function to include validation
  const handleProfileSubmitWithValidation = async (e) => {
    e.preventDefault();

    // Run validation before submission
    const isValid = runValidation(formData);

    if (!isValid) {
      showMessage('Please correct the highlighted errors before saving.', 'error');
      return;
    }

    try {
      const result = await handleSubmit(e);
      if (result.status === 'success') {
        showMessage('Profile updated successfully!', 'success');
        setValidationErrors({}); // Clear errors on success
      } else {
        showMessage(result.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  };

  // Helper component for error display
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle size={16} className="mr-1" />
        {error}
      </p>
    );
  };

  // Check if there are any validation errors
  const hasErrors = Object.values(validationErrors).some(error => error);
  // Close confirmation modal
  const closeConfirmation = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning'
    });
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (confirmationModal.onConfirm) {
      confirmationModal.onConfirm();
    }
    closeConfirmation();
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'documents' && userData?.id) {
      loadDocuments();
    }
  }, [activeTab, userData?.id, loadDocuments]);

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
        resetPasswordData();
        showMessage('Password changed successfully!', 'success');
      }
      // Error is handled by the hook itself
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
    showConfirmation(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture? This action cannot be undone.',
      async () => {
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
      },
      {
        confirmText: 'Delete',
        type: 'danger'
      }
    );
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
    showConfirmation(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      async () => {
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
      },
      {
        confirmText: 'Delete',
        type: 'danger'
      }
    );
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
  const capitalize = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");



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
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <form onSubmit={handleProfileSubmitWithValidation}>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-center mb-6">
                      <div className="relative group mb-4 sm:mb-0 sm:mr-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {userData.profile_picture ?
                            <img
                              src={handleProfilePicture(`${userData.profile_picture}`)}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                            :
                            <User
                              size={32}
                              className={`text-blue-600 ${userData.profile_picture ? 'hidden' : 'block'}`}
                            />
                          }
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
                            type="button"
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
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => {
                            const value = capitalize(e.target.value);
                            handleInputChange({
                              target: { name: "firstName", value }
                            });
                            handleProfileInputChange({
                              target: { name: "firstName", value }
                            });
                          }}
                          onBlur={() => runValidation(formData)}
                          className={`w-full p-2 border ${validationErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                          required
                        />
                        <ErrorMessage error={validationErrors.firstName} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => {
                            const value = capitalize(e.target.value);
                            handleInputChange({
                              target: { name: "lastName", value }
                            });
                            handleProfileInputChange({
                              target: { name: "lastName", value }
                            });
                          }}
                          onBlur={() => runValidation(formData)}
                          className={`w-full p-2 border ${validationErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                          required
                        />
                        <ErrorMessage error={validationErrors.lastName} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleProfileInputChange}
                              onBlur={() => runValidation(formData)}
                              className={`w-full p-2 border ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                              required
                            />
                          </div>
                        </div>
                        <ErrorMessage error={validationErrors.email} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <Smartphone size={18} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              name="phone"
                              value={formData.phone}
                              maxLength={10}
                              onKeyDown={(e) => {
                                const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Allow only digits
                                if (!/^[0-9]*$/.test(value)) return;
                                // Enforce starting with 9
                                if (value.length === 1 && value !== "9") return;
                                // Limit to 10 digits
                                if (value.length > 10) return;
                                handleInputChange(e);
                                handleProfileInputChange(e);
                              }}
                              onBlur={() => runValidation(formData)}
                              placeholder="9123456789"
                              className={`w-full p-2 border ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                              required
                            />
                          </div>
                        </div>
                        <ErrorMessage error={validationErrors.phone} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <MapPin size={18} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              required
                              onChange={handleProfileInputChange}
                              onBlur={() => runValidation(formData)}
                              className={`w-full p-2 border ${validationErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                              placeholder="Enter your complete address"
                            />
                          </div>
                        </div>
                        <ErrorMessage error={validationErrors.address} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleProfileInputChange}
                          onBlur={() => runValidation(formData)}
                          className={`w-full p-2 border ${validationErrors.emergencyContact ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:outline-none`}
                          placeholder="Name and phone number"
                          required
                        />
                        <ErrorMessage error={validationErrors.emergencyContact} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center ${hasErrors ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={hasErrors}
                    >
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
                            href={`${n}/api/components/documents.php?file=${doc.document_path}`}
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

      {/* Custom Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className={`flex-shrink-0 mr-3 ${confirmationModal.type === 'danger' ? 'text-red-500' :
                confirmationModal.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {confirmationModal.title}
                </h3>
                <p className="text-gray-600">
                  {confirmationModal.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeConfirmation}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {confirmationModal.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmationModal.type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmationModal.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {confirmationModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;