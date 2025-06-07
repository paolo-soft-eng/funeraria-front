import React, { useState, useEffect, useContext } from 'react';
import { EmailContext } from '../EmailContext';
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
  ChevronRight,
  Settings as SettingsIcon,
  Save
} from 'lucide-react';

const ClientProfile = () => {
  const { email } = useContext(EmailContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    purpose: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentDetails, setDocumentDetails] = useState({
    documentName: '',
    documentType: ''
  });

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });


  const API_BASE_URL = 'http://localhost/apii/components/user_profile.php';
  const IMAGE_BASE_URL = 'http://localhost/apii/components/';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
  ];

  // Add login validation
  useEffect(() => {
    if (email) {
      // Fetch user ID based on email
      fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setError('Please log in to access your profile');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          setError('Failed to verify login status');
        });
    } else {
      setIsLoggedIn(false);
      setError('Please log in to access your profile');
    }
  }, [email]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        if (!email) {
          throw new Error("Email is not available in context");
        }

        console.log("Fetching data for email:", email); // Add this line

        const response = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success' && data.data) {
          setUserData(data.data);
          setFormData({
            firstName: data.data.first_name || '',
            lastName: data.data.last_name || '',
            email: data.data.email || '',
            phone: data.data.telephone || '',
            address: data.data.address || '',
            emergencyContact: data.data.emergency_contact || ''
          });
        } else {
          throw new Error(data.message || 'Failed to load user data');
        }
      } catch (err) {
        console.error("Error in loadUserData:", err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      loadUserData();
    }
  }, [email]);

  // Add this function to handle appointment creation
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_appointment',
          user_id: userData.id,
          date: appointmentData.date,
          time: appointmentData.time,
          purpose: appointmentData.purpose
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        showMessage('Appointment scheduled successfully!', 'success');
        setIsAppointmentModalOpen(false);
        setAppointmentData({ date: '', time: '', purpose: '' });
        // Refresh appointments
        loadAppointments();
      } else {
        showMessage(data.message || 'Failed to schedule appointment', 'error');
      }
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      showMessage('Failed to schedule appointment. Please try again.', 'error');
    }
  };

  // Add this function to load appointments
  const [appointments, setAppointments] = useState([]);


  const handleProfilePicture = (profilePicture) => {
    if (!profilePicture) {
      return `${IMAGE_BASE_URL}uploads/default.jpg`;
    }

    // Check if the URL is already absolute
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }

    // Otherwise, prepend the base URL
    return `${IMAGE_BASE_URL}${profilePicture}`;
  };
  const loadAppointments = async () => {
    try {
      if (!userData?.id) {
        throw new Error("User ID is missing");
      }

      const response = await fetch(`${API_BASE_URL}?action=get_appointments&user_id=${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setAppointments(data.data || []);
      } else {
        showMessage(data.message || 'Failed to load appointments', 'error');
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      showMessage('Failed to load appointments. Please try again.', 'error');
    }
  };

  const handleRescheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reschedule_appointment',
          user_id: userData.id,
          appointment_id: selectedAppointment.id,
          date: rescheduleData.date,
          time: rescheduleData.time
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        showMessage('Appointment rescheduled successfully!', 'success');
        setIsRescheduleModalOpen(false);
        setRescheduleData({ date: '', time: '' });
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        showMessage(data.message || 'Failed to reschedule appointment', 'error');
      }
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      showMessage('Failed to reschedule appointment. Please try again.', 'error');
    }
  };

  // Call loadAppointments when the appointments tab is active
  useEffect(() => {
    if (activeTab === 'appointments' && userData?.id) {
      loadAppointments();
    }
  }, [activeTab, userData?.id]);

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'cancel_appointment',
            user_id: userData.id,
            appointment_id: appointmentId
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          showMessage('Appointment cancelled successfully', 'success');
          loadAppointments();
        } else {
          showMessage(data.message || 'Failed to cancel appointment', 'error');
        }
      } catch (err) {
        console.error("Error cancelling appointment:", err);
        showMessage('Failed to cancel appointment. Please try again.', 'error');
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to permanently delete this appointment? This action cannot be undone.")) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete_appointment',
            user_id: userData.id,
            appointment_id: appointmentId
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          showMessage('Appointment deleted successfully', 'success');
          loadAppointments();
        } else {
          showMessage(data.message || 'Failed to delete appointment', 'error');
        }
      } catch (err) {
        console.error("Error deleting appointment:", err);
        showMessage('Failed to delete appointment. Please try again.', 'error');
      }
    }
  };


  const loadDocuments = async () => {
    try {
      if (!userData?.id) {
        throw new Error("User ID is missing");
      }

      console.log("Fetching documents for user_id:", userData.id);

      const response = await fetch(`http://localhost/apii/components/documents.php?user_id=${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log("Documents API response:", data);

      if (data.status === 'success') {
        setDocuments(data.data || []);
      } else {
        showMessage(data.message || 'Failed to load documents', 'error');
      }
    } catch (err) {
      console.error("Error loading documents:", err);
      showMessage('Failed to load documents. Please try again.', 'error');
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentFile || !documentDetails.documentName || !documentDetails.documentType) {
      showMessage('All fields are required, including the file', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userData.id); // Ensure user_id is included
      formData.append('document', documentFile); // The file itself
      formData.append('document_name', documentDetails.documentName); // Document name
      formData.append('document_type', documentDetails.documentType); // Document type

      const response = await fetch(`${API_BASE_URL}/documents.php`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        showMessage('Document uploaded successfully!', 'success');
        setIsDocumentModalOpen(false);
        setDocumentFile(null);
        setDocumentDetails({ documentName: '', documentType: '' });
        loadDocuments(); // Refresh the documents list
      } else {
        showMessage(data.message || 'Failed to upload document', 'error');
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      showMessage('Failed to upload document. Please try again.', 'error');
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const response = await fetch(`http://localhost/apii/components/documents.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'delete_document', // Ensure action is included
            document_id: documentId
          })
        });

        const data = await response.json();
        if (data.status === 'success') {
          showMessage('Document deleted successfully', 'success');
          loadDocuments();
        } else {
          showMessage(data.message || 'Failed to delete document', 'error');
        }
      } catch (err) {
        console.error("Error deleting document:", err);
        showMessage('Failed to delete document. Please try again.', 'error');
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'documents' && userData?.id) {
      loadDocuments();
    }
  }, [activeTab, userData?.id]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userData.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          telephone: formData.phone,
          address: formData.address,
          emergency_contact: formData.emergencyContact
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        showMessage('Profile updated successfully!', 'success');
      } else {
        showMessage(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password',
          user_id: userData.id,
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsResetModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('Password changed successfully!', 'success');
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('user_id', userData.id);
        formData.append('profile_picture', file);

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.status === 'success' && data.image_path) {
          const fullImagePath = handleProfilePicture(data.image_path);

          setUserData({
            ...userData,
            profile_picture: fullImagePath
          });
          showMessage('Profile picture updated successfully!', 'success');
        } else {
          showMessage(data.message || 'Failed to upload profile picture', 'error');
        }
      } catch (err) {
        console.error("Error uploading profile picture:", err);
        showMessage('Failed to upload profile picture. Please try again.', 'error');
      }
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
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
            <p className="mt-2 text-gray-600">Please log in to access your profile settings.</p>
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

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-center mb-6">
                      <div className="relative group mb-4 sm:mb-0 sm:mr-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={handleProfilePicture(userData.profile_picture)}
                            alt="Profile"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = `${IMAGE_BASE_URL}uploads/default.jpg`;
                            }}
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
                            onChange={handleProfilePictureUpload}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-3">Upload a clear photo of yourself</p>
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
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {isDocumentModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                      <h3 className="text-lg font-medium mb-4">Upload New Document</h3>
                      <form onSubmit={handleDocumentUpload}>
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
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
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

                      <form onSubmit={handleRescheduleAppointment}>
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

                {/* Appointment Modal */}
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

                      <form onSubmit={handleCreateAppointment}>
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
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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