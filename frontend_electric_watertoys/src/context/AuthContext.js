// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Création du contexte d'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Vérifier si le token est valide
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      return false;
    }
  };

  // Charger l'utilisateur à partir du token stocké
  const loadUser = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    
    if (token && userFromStorage && isTokenValid(token)) {
      const user = JSON.parse(userFromStorage);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await fetchCart(token);
    } else {
      // Nettoyer les informations d'authentification si le token est invalide
      logout();
    }
    
    setLoading(false);
  };

  // Récupérer le panier de l'utilisateur
  const fetchCart = async (token = localStorage.getItem('token')) => {
    if (!token || !isTokenValid(token)) return;
    
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      
      if (error.response && error.response.status === 401) {
        // Token invalide ou expiré
        logout();
      }
    }
  };

  // Ajouter un produit au panier
  const addToCart = async (product, quantity = 1) => {
    const token = localStorage.getItem('token');
    
    if (!token || !isTokenValid(token)) {
      // Stocker l'ID du produit si l'utilisateur n'est pas connecté
      localStorage.setItem('pendingProductId', product.id);
      localStorage.setItem('redirectAfterLogin', '/product');
      return { success: false, message: "Vous devez être connecté pour ajouter un produit au panier" };
    }
    
    try {
      await axios.post('http://localhost:5000/api/cart/items', {
        productId: product.id,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualiser le panier après l'ajout
      await fetchCart(token);
      return { success: true, message: "Produit ajouté au panier avec succès" };
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      
      if (error.response && error.response.status === 401) {
        // Token invalide ou expiré
        logout();
        return { success: false, message: "Votre session a expiré. Veuillez vous reconnecter." };
      }
      
      return { 
        success: false, 
        message: "Impossible d'ajouter le produit au panier: " + (error.response?.data?.message || error.message)
      };
    }
  };

  // Supprimer un produit du panier
  const removeFromCart = async (itemId) => {
    const token = localStorage.getItem('token');
    
    if (!token || !isTokenValid(token)) {
      return { success: false, message: "Vous devez être connecté pour supprimer un produit du panier" };
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualiser le panier après la suppression
      await fetchCart(token);
      return { success: true, message: "Produit supprimé du panier avec succès" };
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      
      if (error.response && error.response.status === 401) {
        // Token invalide ou expiré
        logout();
        return { success: false, message: "Votre session a expiré. Veuillez vous reconnecter." };
      }
      
      return { 
        success: false, 
        message: "Impossible de supprimer le produit du panier: " + (error.response?.data?.message || error.message)
      };
    }
  };

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${apiUrl}/auth/signin`, credentials);
      
      const { accessToken, id, email, role } = response.data;
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify({ id, email, role }));
      
      // Mettre à jour l'état d'authentification
      setCurrentUser({ id, email, role });
      setIsAuthenticated(true);
      
      // Récupérer le panier de l'utilisateur
      await fetchCart(accessToken);
      
      // Vérifier s'il y a un produit en attente à ajouter au panier
      const pendingProductId = localStorage.getItem('pendingProductId');
      
      if (pendingProductId) {
        try {
          await axios.post(`${apiUrl}/cart/items`, {
            productId: parseInt(pendingProductId),
            quantity: 1
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          // Récupérer le panier mis à jour
          await fetchCart(accessToken);
          
          // Nettoyer les données temporaires
          localStorage.removeItem('pendingProductId');
          
          return { 
            success: true, 
            pendingProductAdded: true,
            message: "Connexion réussie et produit ajouté au panier"
          };
        } catch (err) {
          console.error('Erreur lors de l\'ajout du produit en attente:', err);
          // Continuer avec la connexion normale en cas d'échec
        }
      }
      
      return { success: true, message: "Connexion réussie" };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Erreur lors de la connexion"
      };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/auth/signup`, userData);
      
      // Connecter automatiquement après l'inscription
      return await login({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Erreur lors de l'inscription"
      };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token et les informations utilisateur du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Réinitialiser l'état d'authentification
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCart([]);
  };

  // Effet pour charger l'utilisateur au démarrage de l'application
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valeurs exposées par le contexte
  const contextValue = {
    currentUser,
    isAuthenticated,
    loading,
    cart,
    login,
    register,
    logout,
    fetchCart,
    addToCart,
    removeFromCart,
    isTokenValid
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;