import { useState, useEffect } from "react";
import { fetchServices } from "../../Api";

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServices();
      setServices(data || []);
    } catch (err) {
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  return { services, loading, error, refetch: fetchServicesData };
};
