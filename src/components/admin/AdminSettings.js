import React, { useState, useContext, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Users,
  HelpCircle,
  Mail,
  Bug,
  Smartphone,
  Save,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';

import AdminLayout from './AdminLayout';
import { EmailContext } from '../EmailContext';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    facility: 'Funeraria Gomez Main Chapel',
    position: 'Funeral Director',
    address: '',
    emergencyContact: '',
    role: 'admin',
    notifications: {
      email: true,
      sms: false,
    },
    profileImage: null,
    // Add facility fields
    facilityName: '',
    facilityAddress: '',
    facilityPhone: '',
    facilityEmail: '',
    facilityWebsite: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const { email } = useContext(EmailContext);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePreview, setProfilePreview] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    position: 'Support Staff',
    email: ''
  });

  // Add this state for editing
  const [editingStaff, setEditingStaff] = useState(null);

  // Add this state near your other state declarations
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Add this state near your other state declarations
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (email) {
      fetchProfileData();
      fetchFacilityData();
      fetchNotificationData();
    }
  }, [email]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost/apii/components/fetchAdminProfile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched profile data:', data);

      if (data.success) {
        setFormData(prevData => ({
          ...prevData,
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          email: data.data.email || email,
          phone: data.data.phone || '',
          address: data.data.address || '',
          emergencyContact: data.data.emergencyContact || '',
          role: data.data.role || 'admin'
        }));

        // If there's a profile image path, set it for preview
        if (data.data.profileImage) {
          setProfilePreview(data.data.profileImage);
        }
      } else {
        console.error('Failed to fetch profile:', data.message);
        setStatusMessage({
          type: 'error',
          message: `Failed to load profile: ${data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setStatusMessage({
        type: 'error',
        message: `Error loading profile: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationData = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/fetchNotifications.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched notification data:', data);

      if (data.success) {
        setFormData(prevData => ({
          ...prevData,
          notifications: {
            email: data.data.notifications.email,
            sms: data.data.notifications.sms
          }
        }));
      } else {
        console.log('No notification data found or error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notification data:', error);
    }
  };

  const fetchFacilityData = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/fetchFacilityInfo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched facility data:', data);

      if (data.success) {
        setFormData(prevData => ({
          ...prevData,
          facilityName: data.data.facilityName || '',
          facilityAddress: data.data.facilityAddress || '',
          facilityPhone: data.data.facilityPhone || '',
          facilityEmail: data.data.facilityEmail || '',
          facilityWebsite: data.data.facilityWebsite || ''
        }));
      } else {
        console.log('No facility data found or error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching facility data:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/staff.php');
      const data = await response.json();
      if (data.success) {
        setStaffMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const addStaffMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/apii/components/staff.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStaff)
      });
      const data = await response.json();
      if (data.success) {
        setNewStaff({
          fullName: '',
          position: 'Support Staff',
          email: ''
        });
        fetchStaff(); // Refresh the staff list
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const deleteStaffMember = async (staffId) => {
    try {
      const response = await fetch('http://localhost/apii/components/staff.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId })
      });
      const data = await response.json();
      if (data.success) {
        setStaffToDelete(null); // Close the dialog
        fetchStaff(); // Refresh the staff list
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  // Add this function to handle the delete confirmation
  const confirmDelete = (staff) => {
    setStaffToDelete(staff);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [name]: checked
      }
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setStatusMessage({
          type: 'error',
          message: 'Only JPG, PNG & GIF files are allowed.'
        });
        return;
      }

      if (file.size > 5000000) {
        setStatusMessage({
          type: 'error',
          message: 'File is too large. Maximum size is 5MB.'
        });
        return;
      }

      setFormData({
        ...formData,
        profileImage: file
      });

      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);

      // Clean up previous preview URL
      if (profilePreview && profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }

      setProfilePreview(previewUrl);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', message: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('emergencyContact', formData.emergencyContact);
      formDataToSend.append('role', formData.role);

      if (formData.profileImage instanceof File) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      console.log('Submitting form data:', Object.fromEntries(formDataToSend));

      const response = await fetch('http://localhost/apii/components/updateAdminProfile.php', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Expected JSON response but got: ' + text.substring(0, 100) + '...');
      }

      const data = await response.json();
      console.log('Update response:', data);

      if (data.success) {
        setStatusMessage({
          type: 'success',
          message: data.message || 'Settings saved successfully!'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: data.message || 'Error saving settings.'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setStatusMessage({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost/apii/components/updateNotifications.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          notifications: formData.notifications
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notifications update response:', data);

      if (data.success) {
        setStatusMessage({
          type: 'success',
          message: data.message || 'Notification preferences saved successfully!'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: data.message || 'Error saving notification preferences.'
        });
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setStatusMessage({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', message: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({
        type: 'error',
        message: 'New password and confirmation do not match.'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost/apii/components/updateAdminPassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Password update response:', data);

      if (data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setStatusMessage({
          type: 'success',
          message: data.message || 'Password changed successfully!'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: data.message || 'Error changing password.'
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setStatusMessage({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  const removeProfileImage = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/removeProfileImage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.success) {
        // Clean up the object URL if it exists
        if (profilePreview && profilePreview.startsWith('blob:')) {
          URL.revokeObjectURL(profilePreview);
        }
  
        setFormData(prevData => ({
          ...prevData,
          profileImage: null
        }));
        
        setProfilePreview(null);
        
        setStatusMessage({
          type: 'success',
          message: 'Profile picture removed successfully'
        });
      } else {
        throw new Error(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setStatusMessage({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  // Add this function to handle staff updates
  const updateStaffMember = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost/apii/components/staff.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editingStaff)
        });
        const data = await response.json();
        if (data.success) {
            setShowEditModal(false); // Close the modal
            setEditingStaff(null);
            fetchStaff(); // Refresh the staff list
            setStatusMessage({
                type: 'success',
                message: 'Staff member updated successfully'
            });
        } else {
            setStatusMessage({
                type: 'error',
                message: data.message || 'Error updating staff member'
            });
        }
    } catch (error) {
        console.error('Error updating staff:', error);
        setStatusMessage({
            type: 'error',
            message: 'Error updating staff member'
        });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={18} /> },
    { id: 'report', label: 'Report Bug', icon: <Bug size={18} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
  ];
  
  const [isBugSubmitting, setIsBugSubmitting] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [bugReportStatus, setBugReportStatus] = useState(null);


  const handleReportBug = async (e) => {
    e.preventDefault();
    setIsBugSubmitting(true);
    setBugReportStatus(null);
  
    try {
      const response = await fetch('http://localhost/apii/components/adminBug.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {email: formData.email || email, 
          description: bugDescription
        })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setBugReportStatus({ type: 'success', message: data.message });
        setBugDescription('');
      } else {
        setBugReportStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setBugReportStatus({ type: 'error', message: 'Failed to submit bug report. Please try again.' });
    } finally {
      setIsBugSubmitting(false);
    }
  };

  return (
    <AdminLayout currentPage="settings">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Settings</h1>
          <p className="text-gray-600">Manage your funeral home administration settings</p>
        </div>
        {statusMessage.message && (
          <div className={`mb-4 p-3 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {statusMessage.message}
          </div>
        )}
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

            <div className="flex-1 p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row items-center mb-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 sm:mb-0 sm:mr-6 overflow-hidden">
                          {profilePreview && (
                            <img
                              src={profilePreview.startsWith('blob:')
                                ? profilePreview
                                : `http://localhost/apii/components/${profilePreview}`}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-1">Profile Picture</h3>
                          <p className="text-sm text-gray-500 mb-3">Upload a professional photo</p>
                          <div className="flex space-x-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="hidden"
                              id="profileImageUpload"
                            />
                            <label
                              htmlFor="profileImageUpload"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
                            >
                              Upload Image
                            </label>
                            <button
                              type="button"
                              onClick={removeProfileImage}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                            >
                              Remove
                            </button>
                          </div>
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
                              readOnly
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Contact
                          </label>
                          <input
                            type="text"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
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
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
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
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                        minLength="8"
                      />
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="
finish it
                        px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  <form onSubmit={handleNotificationsSubmit}>
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="email"
                          checked={formData.notifications.email}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                        />
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                          Receive email notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          name="sms"
                          checked={formData.notifications.sms}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                        />
                        <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                          Receive SMS notifications
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'staff' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Staff Management</h2>
                  
                  {/* Add/Edit Staff Form */}
                  <form onSubmit={editingStaff ? updateStaffMember : addStaffMember}>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={editingStaff ? editingStaff.fullName : newStaff.fullName}
                            onChange={(e) => editingStaff 
                              ? setEditingStaff({...editingStaff, fullName: e.target.value})
                              : setNewStaff({...newStaff, fullName: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <select 
                            value={editingStaff ? editingStaff.position : newStaff.position}
                            onChange={(e) => editingStaff
                              ? setEditingStaff({...editingStaff, position: e.target.value})
                              : setNewStaff({...newStaff, position: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option>Support Staff</option>
                            <option>Embalmer</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Email"
                            value={editingStaff ? editingStaff.email : newStaff.email}
                            onChange={(e) => editingStaff
                              ? setEditingStaff({...editingStaff, email: e.target.value})
                              : setNewStaff({...newStaff, email: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                        </button>
                        {editingStaff && (
                          <button
                            type="button"
                            onClick={() => setEditingStaff(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                  

                  {/* Staff List */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Current Staff Members</h3>
                    <div className="space-y-4">
                      {staffMembers.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{staff.full_name}</h4>
                            <p className="text-sm text-gray-600">{staff.position}</p>
                            <p className="text-sm text-gray-500">{staff.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingStaff({
                                  staffId: staff.id,
                                  fullName: staff.full_name,
                                  position: staff.position,
                                  email: staff.email
                                });
                                setShowEditModal(true);
                              }}
                              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(staff)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'report' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Report Bug</h2>
                  <form onSubmit={handleReportBug}>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe the issue(English, Tagalog, Bisaya)
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                        disabled={isBugSubmitting}
                      >
                        {isBugSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'help' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Help & Support</h2>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Contact Support</h3>
                    <p className="text-gray-600 mb-4">
                      For assistance with the Funeral Management System, please contact:
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium">Funeraria Gomez Support Team</p>
                      <p className="text-blue-600">support@funerariagomez.com</p>
                      <p className="text-blue-600">(555) 987-6543</p>
                      <p className="text-sm text-gray-500 mt-2">Monday-Friday, 8am-5pm</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">System Documentation</h3>
                    <div className="space-y-2">
                      <a href="#" className="block text-blue-600 hover:underline">
                        User Manual
                      </a>
                      <a href="#" className="block text-blue-600 hover:underline">
                        Arrangement Process Guide
                      </a>
                      <a href="#" className="block text-blue-600 hover:underline">
                        Reporting Features
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Staff Removal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {staffToDelete.full_name} from the staff list? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteStaffMember(staffToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Staff Member</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaff(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={updateStaffMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingStaff.fullName}
                    onChange={(e) => setEditingStaff({...editingStaff, fullName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select 
                    value={editingStaff.position}
                    onChange={(e) => setEditingStaff({...editingStaff, position: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option>Support Staff</option>
                    <option>Embalmer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;