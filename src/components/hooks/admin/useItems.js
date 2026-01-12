import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useItems = (currentPage, itemsPerPage) => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const n = process.env.REACT_APP_API_URL;

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${n}/api/components/itemlist.php?page=${currentPage}&limit=${itemsPerPage}`
      );

      if (res.data.items) {
        setItems(res.data.items);
        setTotalItems(res.data.total || res.data.items.length);
      } else {
        setItems(res.data);
        setTotalItems(res.data.length);
      }
    } catch (err) {
      toast.error('Error fetching items ❌');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, itemsPerPage]);

  return { items, setItems, totalItems, isLoading, setIsLoading, fetchItems };
};