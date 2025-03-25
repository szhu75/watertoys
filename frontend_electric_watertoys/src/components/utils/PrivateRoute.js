// src/components/utils/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // Si l'utilisateur n'est pas connecté
  if (!user || !token) {
    return <Navigate to="/login" />;
  }
  
  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PrivateRoute;