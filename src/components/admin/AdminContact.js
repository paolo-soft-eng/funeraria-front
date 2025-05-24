import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

export const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Function to fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost/apii/components/fetchContacts.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setContacts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a contact
  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const response = await fetch('http://localhost/apii/components/fetchContacts.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setContacts(contacts.filter(contact => contact.id !== id));
        alert('Contact deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete contact');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error deleting contact:', err);
    }
  };

  // Function to copy contact info to clipboard
  const copyContact = (contact) => {
    const contactInfo = `
      Name: ${contact.name}
      Email: ${contact.email}
      Phone: ${contact.phone}
      Message: ${contact.message}
      Date Submitted: ${contact.formatted_date}
    `;
    
    navigator.clipboard.writeText(contactInfo.trim())
      .then(() => alert('Contact information copied to clipboard'))
      .catch(err => {
        console.error('Could not copy text: ', err);
        alert('Failed to copy contact information');
      });
  };

  return (
    <AdminLayout currentPage='contacts'>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Management</h1>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse text-gray-500">Loading contacts...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <button 
              onClick={fetchContacts}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">{contacts.length} contacts found</p>
              <button 
                onClick={fetchContacts}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.length > 0 ? (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{contact.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{contact.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="overflow-hidden text-ellipsis">
                            {contact.message}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{contact.formatted_date}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyContact(contact)}
                              className="text-green-600 hover:text-green-800"
                              title="Copy contact info"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete contact"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                        No contacts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;