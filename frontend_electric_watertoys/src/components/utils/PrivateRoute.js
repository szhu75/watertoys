// src/components/utils/PrivateRoute.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Fonction pour vérifier l'authentification
    const checkAuth = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        // Si l'utilisateur n'est pas connecté
        if (!user || !token) {
          // Stocker l'URL actuelle pour y revenir après la connexion
          localStorage.setItem('returnUrl', location.pathname);
          
          // Programmer la redirection avec un délai pour éviter les erreurs de navigation
          const redirectTimer = setTimeout(() => {
            navigate('/login');
          }, 100);
          
          return () => clearTimeout(redirectTimer);
        }
        
        // Si un rôle spécifique est requis
        if (requiredRole === 'admin') {
          // Vérifier à la fois role et isAdmin pour plus de sécurité
          if (user.role !== 'admin' && user.isAdmin !== true) {
            console.log("Accès refusé - L'utilisateur n'est pas admin", user);
            
            // Programmer la redirection avec un délai
            const redirectTimer = setTimeout(() => {
              navigate('/dashboard');
            }, 100);
            
            return () => clearTimeout(redirectTimer);
          }
        }
        
        // Si l'utilisateur est autorisé
        setIsAuthorized(true);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification", error);
        
        // En cas d'erreur, rediriger vers la page de connexion
        const redirectTimer = setTimeout(() => {
          navigate('/login');
        }, 100);
        
        return () => clearTimeout(redirectTimer);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, requiredRole, location.pathname]);
  
  // Afficher un composant de chargement pendant la vérification
  if (isLoading) {
    return <div className="loading-auth">Vérification de l'authentification...</div>;
  }
  
  // Rendre les enfants uniquement si l'utilisateur est autorisé
  return isAuthorized ? children : null;
};

export default PrivateRoute;