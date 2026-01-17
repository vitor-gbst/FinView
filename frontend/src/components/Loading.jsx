import React from 'react';
import './Loading.css';

const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;