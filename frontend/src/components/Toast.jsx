import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' && '✅'}
      {type === 'error' && '⚠️'}
      {type === 'info' && 'ℹ️'}
      <span>{message}</span>
    </div>
  );
};

export default Toast;