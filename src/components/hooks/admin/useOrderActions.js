import axios from 'axios';

export const useOrderActions = (userId, userName, fetchOrders) => {
  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.post('http://localhost/apii/components/updateClientOrderStatus.php', {
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

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await axios.post('http://localhost/apii/components/deleteClientOrder.php', {
        orderId: orderId,
        user_id: userId,
        user_name: userName
      });

      if (response.data.success) {
        return { success: true, orderId };
      } else {
        throw new Error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return {
    handleAcceptOrder,
    handleDeleteOrder
  };
};