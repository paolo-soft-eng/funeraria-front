import { useState } from "react";
import { placeOrder } from "../../service/Api";

export const useOrder = (email, userId, showNotification) => {
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

      await placeOrder(orderData);

      setOrderStatus({ type: "success", message: "Order placed successfully!" });
      showNotification?.("Order placed successfully!", "success");

      if (onSuccess) onSuccess();

    } catch (error) {
      setOrderStatus({ type: "error", message: "Failed to place order. Please try again." });
      showNotification?.("Failed to place order. Please try again.", "error");
    }
  };

  return { orderStatus, submitOrder, setOrderStatus };
};
