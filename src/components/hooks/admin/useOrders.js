import { useState, useEffect } from 'react';
import axios from 'axios';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
      const n = process.env.REACT_APP_API_URL;

  const fetchOrders = async (currentPage, ordersPerPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${n}/api/components/adminOrders.php?page=${currentPage}&limit=${ordersPerPage}`
      );
      
      const data = response.data;
      
      if (data.orders) {
        setOrders(data.orders);
        setTotalOrders(data.total);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalOrders(data.length);
      } else {
        console.error('Unexpected response format:', data);
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    totalOrders,
    isLoading,
    error,
    fetchOrders,
    setOrders
  };
};