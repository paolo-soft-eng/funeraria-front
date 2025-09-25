import { useState, useEffect } from "react";
import { fetchCasketsByServiceId, fetchChapelsByServiceId } from "../../Api";

export const useServiceItems = (serviceId, showNotification) => {
  const [caskets, setCaskets] = useState([]);
  const [chapels, setChapels] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const [casketData, chapelData] = await Promise.all([
          fetchCasketsByServiceId(serviceId),
          fetchChapelsByServiceId(serviceId),
        ]);
        setCaskets(casketData);
        setChapels(chapelData);
      } catch (err) {
        console.error("Failed to load service items:", err);
        showNotification?.("Failed to load service items", "error");
      } finally {
        setLoadingItems(false);
      }
    };

    if (serviceId) fetchItems();
  }, [serviceId, showNotification]);

  return { caskets, chapels, loadingItems };
};
