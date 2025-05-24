import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

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

  

  return (
    <AdminLayout currentPage="clients">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Client Management</h1>
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