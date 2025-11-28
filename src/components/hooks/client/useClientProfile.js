// hooks/useClientProfile.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { EmailContext } from '../../utils/EmailContext';

const API_BASE_URL = 'http://localhost/funeraria/api/components/user_profile.php';
const IMAGE_BASE_URL = 'http://localhost/funeraria/api/components/';

// Authentication Hook
export const useAuth = () => {
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const validateLogin = async () => {
      if (email) {
        try {
          const response = await fetch(`http://localhost/funeraria/api/components/getUserId.php?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
            setAuthError(null);
          } else {
            setIsLoggedIn(false);
            setAuthError('Please log in to access your profile');
          }
        } catch (error) {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          setAuthError('Failed to verify login status');
        }
      } else {
        setIsLoggedIn(false);
        setAuthError('Please log in to access your profile');
      }
    };

    validateLogin();
  }, [email]);

  return { isLoggedIn, userId, authError };
};

// User Data Hook
export const useUserData = (email) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!email) {
        throw new Error("Email is not available in context");
      }

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
      } else {
        throw new Error(data.message || 'Failed to load user data');
      }
    } catch (err) {
      console.error("Error in loadUserData:", err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) {
      loadUserData();
    }
  }, [email, loadUserData]);

  return { userData, loading, error, refetch: loadUserData };
};

// Profile Form Hook
export const useProfileForm = (userData) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.telephone || '',
        address: userData.address || '',
        emergencyContact: userData.emergency_contact || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      return data;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return { formData, handleInputChange, handleSubmit };
};

// Password Management Hook
export const usePassword = (userData) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const validatePassword = () => {
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    if (!/\d/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!validatePassword()) return;

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
      return data;
    } catch (err) {
      console.error("Error changing password:", err);
      throw err;
    }
  };

  const resetPasswordData = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  return {
    passwordData,
    passwordError,
    handlePasswordChange,
    handlePasswordSubmit,
    resetPasswordData
  };
};

// Profile Picture Hook
export const useProfilePicture = (userData) => {
  const handleProfilePicture = (profilePicture) => {
    if (!profilePicture) {
      return 
    }
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `${IMAGE_BASE_URL}${profilePicture}`;
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('profile_picture', file);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      throw err;
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_profile_picture',
          user_id: userData.id,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error deleting profile picture:", err);
      throw err;
    }
  };

  return {
    handleProfilePicture,
    handleProfilePictureUpload,
    handleDeleteProfilePicture
  };
};

// Appointments Hook
export const useAppointments = (userData) => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    purpose: ''
  });
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });

  const loadAppointments = useCallback(async () => {
    try {
      if (!userData?.id) return;

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
      }
      return data;
    } catch (err) {
      console.error("Error loading appointments:", err);
      throw err;
    }
  }, [userData?.id]);

  const handleCreateAppointment = async (appointmentData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_appointment',
        user_id: userData.id,
        ...appointmentData
      }),
    });
    return await response.json();
  };

  const handleRescheduleAppointment = async (appointmentId, rescheduleData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reschedule_appointment',
        user_id: userData.id,
        appointment_id: appointmentId,
        ...rescheduleData
      }),
    });
    return await response.json();
  };

  const handleCancelAppointment = async (appointmentId) => {
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
    return await response.json();
  };

  const handleDeleteAppointment = async (appointmentId) => {
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
    return await response.json();
  };

  return {
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
  };
};

// Documents Hook
export const useDocuments = (userData) => {
  const [documents, setDocuments] = useState([]);
  const [documentDetails, setDocumentDetails] = useState({
    documentName: '',
    documentType: ''
  });

  const loadDocuments = useCallback(async () => {
    try {
      if (!userData?.id) return;

      const response = await fetch(`http://localhost/funeraria/api/components/documents.php?user_id=${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setDocuments(data.data || []);
      }
      return data;
    } catch (err) {
      console.error("Error loading documents:", err);
      throw err;
    }
  }, [userData?.id]);

  const handleDocumentUpload = async (file, documentDetails) => {
    const formData = new FormData();
    formData.append('user_id', userData.id);
    formData.append('document', file);
    formData.append('document_name', documentDetails.documentName);
    formData.append('document_type', documentDetails.documentType);

    const response = await fetch('http://localhost/funeraria/api/components/documents.php', {
      method: 'POST',
      body: formData
    });
    return await response.json();
  };

  const handleDeleteDocument = async (documentId) => {
    const response = await fetch(`http://localhost/funeraria/api/components/documents.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'delete_document',
        document_id: documentId
      })
    });
    return await response.json();
  };

  return {
    documents,
    documentDetails,
    setDocumentDetails,
    loadDocuments,
    handleDocumentUpload,
    handleDeleteDocument
  };
};

// Bug Report Hook
export const useBugReport = (userData, email) => {
  const [bugDescription, setBugDescription] = useState('');
  const [isBugSubmitting, setIsBugSubmitting] = useState(false);
  const [bugReportStatus, setBugReportStatus] = useState(null);

  const handleReportBug = async (e) => {
    e.preventDefault();
    setIsBugSubmitting(true);
    setBugReportStatus(null);

    try {
      const response = await fetch('http://localhost/funeraria/api/components/report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData?.id || null,
          email: userData?.email || email,
          description: bugDescription
        })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsBugSubmitting(false);
    }
  };

  const resetBugReport = () => {
    setBugDescription('');
    setBugReportStatus(null);
  };

  return {
    bugDescription,
    setBugDescription,
    isBugSubmitting,
    bugReportStatus,
    setBugReportStatus,
    handleReportBug,
    resetBugReport
  };
};

// Notification Hook
export const useNotification = () => {
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return { message, showMessage, clearMessage };
};