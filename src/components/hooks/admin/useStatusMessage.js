import { useState } from 'react';

export const useStatusMessage = () => {
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  const showSuccess = (message) => {
    setStatusMessage({ type: 'success', message });
  };

  const showError = (message) => {
    setStatusMessage({ type: 'error', message });
  };

  const clearMessage = () => {
    setStatusMessage({ type: '', message: '' });
  };

  return {
    statusMessage,
    showSuccess,
    showError,
    clearMessage
  };
};