import { useState, useCallback } from 'react';

export const useUserInterface = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleMessageClick = useCallback((message) => {
    setSelectedMessage(selectedMessage?.id === message.id ? null : message);
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
    handleMessageClick,
    handleImageClick,
    closeEnlargedImage,
    toggleSidebar,
    setShowSidebar,
    setSelectedMessage  // ← Export this
  };
};