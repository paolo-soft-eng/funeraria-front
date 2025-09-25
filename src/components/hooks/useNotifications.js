import { useState } from "react";

export default function useNotifications() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const clear = () => {
    setError(null);
    setSuccess(null);
  };

  return { error, setError, success, setSuccess, clear };
}
