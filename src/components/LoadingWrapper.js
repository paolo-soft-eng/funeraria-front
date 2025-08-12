import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

const LoadingWrapper = ({ children, minLoadTime = 1000 }) => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return children;
};

export default LoadingWrapper;