import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../EmailContext';
import { useNavigate } from 'react-router-dom';
import { FaTable, FaThLarge, FaUser } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('card');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (email) {
      fetch(
        `http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(
          email
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.userName || 'Admin'); // Set the actual username
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate("/auth");
          }
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
          setIsLoggedIn(false);
          navigate("/auth");
        });
    } else {
      setIsLoggedIn(false);
      navigate("/auth");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchClients();
    }
  }, [isLoggedIn]);

  const fetchClients = () => {
    axios.get('http://localhost/apii/components/fetchClients.php')
      .then(res => {
        if (Array.isArray(res.data)) {
          setClients(res.data);
        } else {
          setClients([]);
          toast.error('Failed to fetch clients ❌');
        }
      })
      .catch(() => {
        setClients([]);
        toast.error('Network error while fetching clients 🚨');
      });
  };

  const confirmAction = (client, action) => {
    setSelectedClient({ ...client, action });
    setShowActionModal(true);
  };

  const handleConfirmAction = () => {
    if (!selectedClient) return;

    axios.post("http://localhost/apii/components/fetchClients.php", {
      id: selectedClient.id,
      action: selectedClient.action,
      userId: userId,
      userName: userName
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.data.success) {
          setClients(clients.map(c =>
            c.id === selectedClient.id
              ? { ...c, status: selectedClient.action === "disable" ? "disabled" : "active" }
              : c
          ));
          setShowActionModal(false);
          toast.success(
            selectedClient.action === "disable"
              ? `Client "${selectedClient.username}" disabled 🚫`
              : `Client "${selectedClient.username}" enabled ✅`
          );
          setSelectedClient(null);
        } else {
          toast.error("Failed to update client ❌");
        }
      })
      .catch((error) => {
        console.error("Update error:", error);
        toast.error("Network error while updating client 🚨");
      });
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setSelectedClient(null);
  };

  // Component for profile picture display
  const ProfilePicture = ({ client, size = 'small' }) => {
    const [imgError, setImgError] = useState(false);
    
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };

    if (imgError || !client.profile_picture) {
      return (
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center`}>
          <FaUser className="text-gray-500 text-xs" />
        </div>
      );
    }

    return (
      <img
        src={client.profile_picture}
        alt={`${client.username}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
          <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
          <div className="mt-6">
            <a
              href="/auth"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="clients">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold text-gray-900">Client Management</h1>
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

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border">
                <thead className="bg-gray-200 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2">Profile</th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Telephone</th>
                    <th className="px-4 py-2">Address</th>
                    <th className="px-4 py-2">Emergency Contact</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="border-b">
                      <td className="px-4 py-2">
                        <ProfilePicture client={client} size="small" />
                      </td>
                      <td className="px-4 py-2">{client.id}</td>
                      <td className="px-4 py-2">{client.username}</td>
                      <td className="px-4 py-2">{client.first_name} {client.last_name}</td>
                      <td className="px-4 py-2">{client.email}</td>
                      <td className="px-4 py-2">{client.telephone}</td>
                      <td className="px-4 py-2">{client.address}</td>
                      <td className="px-4 py-2">{client.emergency_contact}</td>
                      <td className="px-4 py-2">{client.created_at}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-white text-xs ${client.status === "disabled" ? "bg-red-500" : "bg-green-500"}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {client.status === "disabled" ? (
                          <button
                            onClick={() => confirmAction(client, "enable")}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmAction(client, "disable")}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <ProfilePicture client={client} size="large" />
                    <div>
                      <h3 className="text-lg font-semibold">{client.username}</h3>
                      <p className="text-sm text-gray-500">ID: {client.id}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {client.first_name} {client.last_name}</p>
                    <p><span className="font-medium">Email:</span> {client.email}</p>
                    <p><span className="font-medium">Phone:</span> {client.telephone}</p>
                    <p><span className="font-medium">Address:</span> {client.address}</p>
                    <p><span className="font-medium">Emergency:</span> {client.emergency_contact}</p>
                    <p><span className="font-medium">Created:</span> {new Date(client.created_at).toLocaleString()}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-white text-l ${client.status === "disabled" ? "bg-red-500" : "bg-green-500"}`}>
                      {client.status}
                    </span>
                    {client.status === "disabled" ? (
                      <button
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition"
                        onClick={() => confirmAction(client, "enable")}
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                        onClick={() => confirmAction(client, "disable")}
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {clients.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No clients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <ProfilePicture client={selectedClient} size="medium" />
              <div>
                <h2 className="text-lg font-bold">
                  {selectedClient.action === "disable" ? "Disable Client" : "Enable Client"}
                </h2>
                <p className="text-sm text-gray-600">{selectedClient.username}</p>
              </div>
            </div>
            <p className="mb-6 text-sm">
              Are you sure you want to{" "}
              <span className="font-bold">{selectedClient.action}</span>{" "}
              client <span className="font-semibold">{selectedClient.username}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition text-sm"
                onClick={cancelAction}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white text-sm ${
                  selectedClient.action === "disable"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleConfirmAction}
              >
                {selectedClient.action === "disable" ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </AdminLayout>
  );
};

export default AdminClients;