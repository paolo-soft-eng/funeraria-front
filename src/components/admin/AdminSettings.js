import React, { useState, useContext } from 'react';
import {
  User,
  Lock,
  Bell,
  Users,
  HelpCircle,
  Mail,
  Bug,
  Smartphone,
  Save,
  ChevronRight
} from 'lucide-react';

import AdminLayout from './AdminLayout';
import { EmailContext } from '../utils/EmailContext';
import { useProfile } from '../hooks/admin/useProfile';
import { usePassword } from '../hooks/admin/usePassword';
import { useStaff } from '../hooks/admin/useStaff';
import { useBugReport } from '../hooks/admin/useReportBug';
import { useStatusMessage } from '../hooks/admin/useStatusMessage';
import { data } from 'react-router-dom';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { email } = useContext(EmailContext);
  const [profileImageRemovalCancelled, setProfileImageRemovalCancelled] = useState(false);
  
  const {
    formData,
    profilePreview,
    isLoading,
    handleInputChange,
    handleProfileImageChange,
    updateProfile,
    removeProfileImage
  } = useProfile(email);

  const {
    passwordData,
    handlePasswordChange,
    updatePassword
  } = usePassword(email);

  const {
    staffMembers,
    newStaff,
    setNewStaff,
    editingStaff,
    setEditingStaff,
    staffToDelete,
    showEditModal,
    addStaff,
    updateStaff,
    deleteStaff,
    openEditModal,
    closeEditModal,
    confirmDelete,
    cancelDelete
  } = useStaff();

  const {
    bugDescription,
    setBugDescription,
    isBugSubmitting,
    bugReportStatus,
    submitBugReport
  } = useBugReport(email);

  const {
    statusMessage,
    showSuccess,
    showError,
    clearMessage
  } = useStatusMessage();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={18} /> },
    { id: 'report', label: 'Report Bug', icon: <Bug size={18} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
  ];

  // Profile handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    clearMessage();

    if (profileImageRemovalCancelled) {
    showSuccess('Profile updated (image removal was cancelled)');
    setProfileImageRemovalCancelled(false);
    return;
  }

    try {
      const data = await updateProfile();
      if (data.success) {
        showSuccess(data.message || 'Settings saved successfully!');
      } else {
        showError(data.message || 'Error saving settings.');
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
    }
  };


  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessage();

    try {
      const data = await updatePassword();
      if (data.success) {
        showSuccess(data.message || 'Password changed successfully!');
      } else {
        showError(data.message || 'Error changing password.');
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
    }
  };

 const handleRemoveProfileImage = async () => {
    const confirmed = window.confirm("Are you sure you want to remove your profile picture?");
    if (confirmed) {
      try {
        const result = await removeProfileImage();
        if (result.success) {
          showSuccess("Profile successfully removed");
        } else {
          showError(result.message || "Failed to remove profile picture");
        }
      } catch (err) {
        showError("Error removing profile picture");
      }
    }
  };
  // Enhanced profile image upload handler with success message
  const handleProfileImageUploadWithMessage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // You'll need to modify your useProfile hook to return a function that handles the upload
        // For now, using the existing handleProfileImageChange
        handleProfileImageChange(e);
        showSuccess('Profile picture updated successfully!');
      } catch (error) {
        showError('Failed to upload profile picture. Please try again.');
      }
    }
  };

  // Staff handlers
  const handleAddStaff = async (e) => {
    e.preventDefault();
    clearMessage();

    try {
      const data = await addStaff();
      if (data.success) {
        showSuccess('Staff member added successfully');
      } else {
        showError(data.message || 'Error adding staff member');
      }
    } catch (error) {
      showError('Error adding staff member');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    clearMessage();

    try {
      const data = await updateStaff();
      if (data.success) {
        showSuccess('Staff member updated successfully');
      } else {
        showError(data.message || 'Error updating staff member');
      }
    } catch (error) {
      showError('Error updating staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      const data = await deleteStaff(staffId);
      if (data.success) {
        showSuccess('Staff member deleted successfully');
      } else {
        showError(data.message || 'Error deleting staff member');
      }
    } catch (error) {
      showError('Error deleting staff member');
    }
  };

  // Bug report handler
  const handleReportBug = async (e) => {
    e.preventDefault();
    const data = await submitBugReport();
    if (data?.status === 'success') {
      clearMessage();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Settings</h1>
          <p className="text-gray-600">Manage your funeral home administration settings</p>
        </div>

        {/* Status Messages */}
        {statusMessage.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {statusMessage.message}
          </div>
        )}

        {bugReportStatus?.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            bugReportStatus.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {bugReportStatus.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4">
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          clearMessage();
                        }}
                        className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm ${
                          activeTab === tab.id
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

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row items-center mb-6">
                        <div className="relative group mb-4 sm:mb-0 sm:mr-6">
                          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                            {profilePreview ? (
                              <img
                                src={profilePreview.startsWith('blob:')
                                  ? profilePreview
                                  : `http://localhost/apii/components/${profilePreview}`}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={32} />
                            )}
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
                              onChange={handleProfileImageUploadWithMessage}
                            />
                          </label>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-1">Profile Picture</h3>
                          <p className="text-sm text-gray-500 mb-3">Upload a professional photo</p>
                          {profilePreview && (
                            <button
                              onClick={handleRemoveProfileImage}
                              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Remove Picture
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

              {/* Password Tab */}
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

              {/* Staff Tab */}
              {activeTab === 'staff' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Staff Management</h2>

                  {/* Add/Edit Staff Form */}
                  <form onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}>
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
                              ? setEditingStaff({ ...editingStaff, fullName: e.target.value })
                              : setNewStaff({ ...newStaff, fullName: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <select
                            value={editingStaff ? editingStaff.position : newStaff.position}
                            onChange={(e) => editingStaff
                              ? setEditingStaff({ ...editingStaff, position: e.target.value })
                              : setNewStaff({ ...newStaff, position: e.target.value })}
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
                              ? setEditingStaff({ ...editingStaff, email: e.target.value })
                              : setNewStaff({ ...newStaff, email: e.target.value })}
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
                              onClick={() => openEditModal(staff)}
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

              {/* Report Bug Tab */}
              {activeTab === 'report' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Report Bug</h2>
                  <form onSubmit={handleReportBug}>
                    <div className="mb-6">
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

              {/* Help Tab */}
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
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(staffToDelete.id)}
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
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateStaff}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingStaff.fullName}
                    onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
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
                    onChange={(e) => setEditingStaff({ ...editingStaff, position: e.target.value })}
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
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
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