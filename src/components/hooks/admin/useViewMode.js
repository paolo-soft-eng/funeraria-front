import { useState, useEffect } from 'react';

export const useViewMode = (defaultView = 'table') => {
  const [viewMode, setViewMode] = useState(defaultView);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('card');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    viewMode,
    isMobile,
    setViewMode
  };
};