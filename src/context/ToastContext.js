import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToastConfig({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toastConfig.message}
        type={toastConfig.type}
        visible={toastConfig.visible}
        duration={toastConfig.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export default ToastContext;
