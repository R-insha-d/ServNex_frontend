import React from 'react';
import './Preloader.css';

const Preloader = () => {
  return (
    <div className="preloader-container">
      <div className="loader">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="preloader-text">Loading ServNex...</div>
    </div>
  );
};

export default Preloader;