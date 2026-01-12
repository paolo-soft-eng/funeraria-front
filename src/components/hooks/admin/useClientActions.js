import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useClientActions = (userId, userName, fetchClients) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const n = process.env.REACT_APP_API_URL;

  const confirmAction = (client, action) => {
    setSelectedClient({ ...client, action });
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedClient) return;

    try {
      const response = await axios.post(`${n}/api/components/fetchClients.php`, {
        id: selectedClient.id,
        action: selectedClient.action,
        userId: userId,
        userName: userName
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        fetchClients();
        setShowActionModal(false);
        toast.success(
          selectedClient.action === "disable"
            ? `Client "${selectedClient.username}" disabled 🚫`
            : `Client "${selectedClient.username}" enabled ✅`
        );
        setSelectedClient(null);
      } else {
        toast.error(response.data.message || "Failed to update client ❌");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Network error while updating client 🚨");
    }
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setSelectedClient(null);
  };

  return {
    showActionModal,
    selectedClient,
    confirmAction,
    handleConfirmAction,
    cancelAction
  };
};