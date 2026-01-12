import axios from 'axios';
const n = process.env.REACT_APP_API_URL;

export const useOrderActions = (userId, userName) => {
  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.post(`${n}/api/components/updateClientOrderStatus.php`, {
        orderId: orderId,
        status: 'completed',
        payment_status: 'paid',
        user_id: userId,
        user_name: userName
      });

      if (response.data.success) {
        return { success: true, orderId };
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const handleArchiveOrder = async (orderId) => {
    try {
      const response = await axios.post(`${n}/api/components/archiveClientOrder.php`, {
        orderId: orderId,
        user_id: userId,
        user_name: userName
      });

      if (response.data.success) {
        return { success: true, orderId };
      } else {
        throw new Error(response.data.message || 'Failed to archive order');
      }
    } catch (error) {
      console.error('Error archiving order:', error);
      throw error;
    }
  };

  return {
    handleAcceptOrder,
    handleArchiveOrder
  };
};