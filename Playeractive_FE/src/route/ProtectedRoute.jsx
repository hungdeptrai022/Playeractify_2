import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('spotifyToken');

  if (!token) {
    // Nếu không có token, chuyển hướng đến trang login
    return <Navigate to="/login" />;
  }

  // Nếu có token, cho phép truy cập vào component con
  return children;
};

export default ProtectedRoute;