import { useState, useEffect } from "react";
import { fetchItems } from "../../service/Api";

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItemsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchItems();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsData();
  }, []);

  // Helper function to get item by id
  const getItemById = (itemId) => {
    // Convert itemId to number for comparison to handle string/number mismatch
    const numericItemId = parseInt(itemId);
    return items.find(item => parseInt(item.id) === numericItemId);
  };

  // Helper function to get stock by item id
  const getStockByItemId = (itemId) => {
    const item = getItemById(itemId);
    return item ? parseInt(item.stock) : null;
  };

  return { 
    items, 
    loading, 
    error, 
    refetch: fetchItemsData,
    getItemById,
    getStockByItemId
  };
};