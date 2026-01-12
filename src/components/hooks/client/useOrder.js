import { useState } from "react";
import { placeOrder } from "../../service/Api";

export const useOrder = (email, userId, showNotification, refetchItems = null) => {
  const [orderStatus, setOrderStatus] = useState(null);

  const submitOrder = async (formData, selectedCaskets, selectedChapels, onSuccess) => {
    setOrderStatus({ type: "loading", message: "Processing your order..." });

    try {
      const orderData = {
        ...formData,
        user_id: userId,
        selected_caskets: selectedCaskets.map((c) => c.id),
        selected_chapels: selectedChapels.map((c) => c.id),
      };

      const response = await placeOrder(orderData);

      setOrderStatus({ type: "success", message: "Order placed successfully!" });
      showNotification?.("Order placed successfully! Stock updated.", "success");

      // Refetch items to update stock display
      if (refetchItems) {
        refetchItems();
      }

      if (onSuccess) onSuccess();

    } catch (error) {
      const errorMessage = error.message || "Failed to place order. Please try again.";
      setOrderStatus({ type: "error", message: errorMessage });
      showNotification?.(errorMessage, "error");
    }
  };

  return { orderStatus, submitOrder, setOrderStatus };
};