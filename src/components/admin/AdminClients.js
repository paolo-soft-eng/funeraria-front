import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../EmailContext';
import { useNavigate } from 'react-router-dom';
import { FaTable, FaThLarge } from 'react-icons/fa';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Add mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('card');
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            navigate('/auth');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          navigate('/auth');
        });
    } else {
      setIsLoggedIn(false);
      navigate('/auth');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchClients();
    }
  }, [isLoggedIn]);

  const fetchClients = () => {
    axios.get('http://localhost/apii/components/fetchClients.php')
      .then(response => {
        // Check if response is an array (successful GET) or an object (error)
        if (Array.isArray(response.data)) {
          setClients(response.data);
        } else {
          console.error('Error fetching clients:', response.data.message);
          setClients([]); // Set empty array on error
        }
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setClients([]); // Set empty array on network error
      });
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!clientToDelete) return;

    axios.post('http://localhost/apii/components/fetchClients.php', {
      id: clientToDelete.id
    })
      .then(response => {
        if (response.data.success) {
          // Remove client from state to update UI immediately
          setClients(clients.filter(client => client.id !== clientToDelete.id));
          setShowDeleteModal(false);
          setClientToDelete(null);
        } else {
          console.error('Error deleting client:', response.data.message);
          alert('Failed to delete client: ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
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
            <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
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

  return (
    <AdminLayout currentPage="clients">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
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

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firstname</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lastname</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telephone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.first_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.telephone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.emergency_contact}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button 
                          className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition"
                          onClick={() => confirmDelete(client)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{client.username}</h3>
                      <p className="text-sm text-gray-500">ID: {client.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{client.first_name} {client.last_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-sm">{client.email}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{client.telephone}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {client.address}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Emergency Contact:</span> {client.emergency_contact}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Created:</span> {new Date(client.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button 
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                      onClick={() => confirmDelete(client)}
                    >
                      Delete
                    </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the client: <span className="font-semibold">{clientToDelete?.username}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminClients;