import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useClients = (isLoggedIn, currentPage, itemsPerPage, searchTerm, statusFilter) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchClients = async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`http://localhost/apii/components/fetchClients.php?${params}`);
      
      if (response.data.success) {
        setClients(response.data.data || []);
        setTotalPages(response.data.pagination.total_pages);
        setTotalItems(response.data.pagination.total_items);
      } else {
        setClients([]);
        toast.error('Failed to fetch clients ❌');
      }
    } catch (error) {
      setClients([]);
      toast.error('Network error while fetching clients 🚨');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isLoggedIn, currentPage, itemsPerPage, searchTerm, statusFilter]);

  return {
    clients,
    loading,
    totalPages,
    totalItems,
    fetchClients,
    setClients
  };
};