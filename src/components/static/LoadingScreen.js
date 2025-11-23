import React from 'react';
import '../styles/Loading.css'; 

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="spinner"></div>
        <h2 className='loadingh2'>Loading...</h2>
        <p className='loadingp'>Please wait while we prepare your content</p>
      </div>
    </div>
  );
};

export default LoadingScreen;