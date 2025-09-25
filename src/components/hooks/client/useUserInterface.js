import { useState, useCallback } from 'react';

export const useUserInterface = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleMessageClick = useCallback((msg) => {
    setSelectedMessage(selectedMessage === msg ? null : msg);
  }, [selectedMessage]);

  const handleImageClick = useCallback((imageSrc) => {
    setEnlargedImage(imageSrc);
  }, []);

  const closeEnlargedImage = useCallback(() => {
    setEnlargedImage(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  return {
    selectedMessage,
    enlargedImage,
    showSidebar,
    setSelectedMessage,
    handleMessageClick,
    handleImageClick,
    closeEnlargedImage,
    toggleSidebar,
    setShowSidebar
  };
};