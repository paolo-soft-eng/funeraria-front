import { useState } from 'react';

export const useImagePreview = () => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (file, callback) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (callback) callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPreview = () => setPreview(null);

  return { preview, setPreview, handleFileChange, clearPreview };
}