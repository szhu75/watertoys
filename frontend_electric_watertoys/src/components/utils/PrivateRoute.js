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
  
  // Si un rôle spécifique est requis
  if (requiredRole === 'admin') {
    // Vérifier à la fois role et isAdmin pour plus de sécurité
    if (user.role !== 'admin' && user.isAdmin !== true) {
      console.log("Accès refusé - L'utilisateur n'est pas admin", user);
      return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
};

export default PrivateRoute;