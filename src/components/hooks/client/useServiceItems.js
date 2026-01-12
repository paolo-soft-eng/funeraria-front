import { useState, useEffect } from "react";
import { fetchCasketsByServiceId, fetchChapelsByServiceId } from "../../service/Api";

export const useServiceItems = (serviceId, showNotification, shouldRefetch = true) => {
  const [caskets, setCaskets] = useState([]);
  const [chapels, setChapels] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchItems = async () => {
    if (!serviceId) return;
    
    setLoadingItems(true);
    try {
      // Add timestamp to bypass any caching
      const timestamp = new Date().getTime();
      const [casketData, chapelData] = await Promise.all([
        fetchCasketsByServiceId(serviceId, timestamp),
        fetchChapelsByServiceId(serviceId, timestamp),
      ]);
      
      console.log(`Fetched chapels for service ${serviceId}:`, chapelData);
      
      setCaskets(casketData);
      setChapels(chapelData);
    } catch (err) {
      console.error("Failed to load service items:", err);
      showNotification?.("Failed to load service items", "error");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [serviceId, shouldRefetch, refetchTrigger]);

  const refetchItems = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { caskets, chapels, loadingItems, refetchItems };
};