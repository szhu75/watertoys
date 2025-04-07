// src/components/JS/UserDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../CSS/UserDashboard.css';
import Header from './Header';
import Footer from './Footer';

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer le panier de l'utilisateur
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log("Récupération du panier avec le token:", token);
      
      // Vérifier si le panier vient d'être vidé après une commande
      const cartCleared = localStorage.getItem('cartCleared');
      if (cartCleared === 'true') {
        console.log("Le panier a été vidé suite à une commande");
        setCart([]);
        localStorage.removeItem('cartCleared');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Panier récupéré:", response.data);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      setError('Impossible de récupérer votre panier. Veuillez réessayer.');
      
      if (error.response && error.response.status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Récupérer les commandes de l'utilisateur
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentative de récupération des commandes depuis l'API
      let apiOrders = [];
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/orders/user', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            params: {
              _t: new Date().getTime() // Éviter le cache
            }
          });
          
          if (Array.isArray(response.data)) {
            apiOrders = response.data;
            console.log("Commandes récupérées depuis l'API:", apiOrders);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes depuis l\'API:', error);
      }
      
      // Récupérer également les commandes simulées localement
      let clientOrders = [];
      const clientOrdersStr = localStorage.getItem('clientOrders');
      if (clientOrdersStr) {
        try {
          clientOrders = JSON.parse(clientOrdersStr);
          console.log("Commandes simulées récupérées du localStorage:", clientOrders);
          
          // Ajouter une propriété pour identifier les commandes simulées
          clientOrders = clientOrders.map(order => ({
            ...order,
            isClientOrder: true
          }));
        } catch (e) {
          console.error('Erreur lors du parsing des commandes locales:', e);
        }
      }
      
      // Déduplication des commandes
      // On utilise l'ID comme clé unique, donc si une commande avec le même ID existe dans les deux sources,
      // on garde uniquement celle du client (localStorage)
      const orderMap = new Map();
      
      // Ajouter d'abord les commandes API
      apiOrders.forEach(order => {
        orderMap.set(order.id.toString(), order);
      });
      
      // Ajouter les commandes client, elles remplacent celles de l'API si même ID
      clientOrders.forEach(order => {
        orderMap.set(order.id.toString(), order);
      });
      
      // Convertir la Map en tableau
      const allOrders = Array.from(orderMap.values());
      
      // Trier par date (les plus récentes d'abord)
      allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      setOrders(allOrders);
      console.log("Total des commandes combinées (sans doublons):", allOrders.length);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setError('Impossible de récupérer vos commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Supprimer une commande
  const deleteOrder = useCallback((orderId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        // Récupérer les commandes existantes
        const clientOrdersStr = localStorage.getItem('clientOrders');
        if (clientOrdersStr) {
          const clientOrders = JSON.parse(clientOrdersStr);
          
          // Filtrer pour enlever la commande à supprimer
          const updatedOrders = clientOrders.filter(
            order => order.id.toString() !== orderId.toString()
          );
          
          // Sauvegarder les commandes mises à jour
          localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));
          
          // Rafraîchir la liste des commandes
          fetchOrders();
          
          // Notification
          alert('Commande supprimée avec succès!');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
        alert('Erreur lors de la suppression de la commande. Veuillez réessayer.');
      }
    }
  }, [fetchOrders]);
  
  // Supprimer un article du panier
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log(`Suppression de l'article ${itemId} du panier`);
      console.log("URL de la requête:", `http://localhost:5000/api/cart/items/${itemId}`);
      console.log("Token utilisé:", token);
      
      const response = await axios.delete(
        `http://localhost:5000/api/cart/items/${itemId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse de la suppression:", response.data);
      
      // Rafraîchir le panier
      fetchCart();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        console.error('Données de réponse:', error.response.data);
      }
      
      setError('Impossible de supprimer l\'article. Veuillez réessayer.');
      
      if (error.response && error.response.status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCart, navigate]);
  
  // Mettre à jour la quantité d'un article dans le panier
  const updateCartItemQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Si la quantité est inférieure à 1, supprimer l'article
      removeFromCart(itemId);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log(`Mise à jour de l'article ${itemId} avec quantité ${newQuantity}`);
      console.log("URL de la requête:", `http://localhost:5000/api/cart/items/${itemId}`);
      console.log("Données envoyées:", { quantity: newQuantity });
      console.log("Token utilisé:", token);
      
      const response = await axios.put(
        `http://localhost:5000/api/cart/items/${itemId}`, 
        { quantity: newQuantity }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse de la mise à jour:", response.data);
      
      // Rafraîchir le panier après la mise à jour
      fetchCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        console.error('Données de réponse:', error.response.data);
      }
      
      setError('Impossible de mettre à jour la quantité. Veuillez réessayer.');
      
      if (error.response && error.response.status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCart, navigate, removeFromCart]);
  
  // Vider complètement le panier
  const clearCart = useCallback(async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        await axios.delete(
          `http://localhost:5000/api/cart`, 
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Mettre à jour l'état local
        setCart([]);
        
        alert('Votre panier a été vidé avec succès.');
      } catch (error) {
        console.error('Erreur lors du vidage du panier:', error);
        setError('Impossible de vider le panier. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  }, []);
  
  // Passer à la page de paiement
  const checkout = useCallback(() => {
    try {
      // Calculer le montant total du panier
      const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      // Rediriger vers la page de paiement avec les informations du panier
      navigate('/payment', { 
        state: { 
          orderDetails: {
            totalAmount: totalAmount,
            items: cart
          }
        } 
      });
    } catch (error) {
      console.error('Erreur lors de la préparation du paiement:', error);
      setError('Erreur lors de la préparation du paiement. Veuillez réessayer.');
    }
  }, [cart, navigate]);
  
  // Déconnexion
  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);
  
  // Récupérer les informations de l'utilisateur au chargement
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    setUser(userInfo);
    
    // Rediriger l'admin vers son tableau de bord
    if (userInfo.role === 'admin' || userInfo.isAdmin === true) {
      navigate('/admin-dashboard');
      return;
    }
    
    // Vérifier les paramètres d'URL pour le changement de section
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    const refreshParam = searchParams.get('refresh');
    
    // Toujours récupérer le panier
    fetchCart();
    
    // Si on est redirigé vers la section des commandes avec un indicateur de rafraîchissement
    if (sectionParam === 'orders' && refreshParam === 'true') {
      setActiveTab('orders');
      
      // Forcer le rechargement des commandes
      console.log("Rafraîchissement des commandes demandé explicitement");
      fetchOrders();
      
      // Nettoyer les paramètres d'URL
      navigate('/dashboard', { replace: true });
      
      // Afficher un message si on vient de créer une commande
      const orderJustCreated = localStorage.getItem('orderJustCreated');
      if (orderJustCreated === 'true') {
        console.log('Commande créée, affichage du message de confirmation');
        setTimeout(() => {
          alert('Votre commande a été ajoutée à votre historique!');
          localStorage.removeItem('orderJustCreated');
          localStorage.removeItem('newOrderId');
        }, 500);
      }
    } 
    // Pour les autres cas
    else {
      // Charger les commandes au démarrage
      fetchOrders();
      
      // Changer d'onglet si nécessaire
      if (sectionParam === 'cart') {
        setActiveTab('cart');
        navigate('/dashboard', { replace: true });
      } else if (sectionParam === 'orders') {
        setActiveTab('orders');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, location, fetchOrders, fetchCart]);
  
  // Fonction pour rafraîchir manuellement les commandes
  const refreshOrders = () => {
    console.log("Rafraîchissement manuel des commandes");
    fetchOrders();
  };
  
  // Fonction pour voir les détails d'une commande
  const viewOrderDetails = useCallback((orderId) => {
    // Pour une commande simulée, afficher les détails directement
    const clientOrdersStr = localStorage.getItem('clientOrders');
    if (clientOrdersStr) {
      try {
        const clientOrders = JSON.parse(clientOrdersStr);
        const order = clientOrders.find(o => o.id.toString() === orderId.toString());
        
        if (order) {
          // Afficher les détails sous forme d'alerte (simple pour l'exemple)
          alert(`Commande #${order.id}\nDate: ${new Date(order.orderDate).toLocaleDateString()}\nMontant: ${order.totalAmount.toFixed(2)}€\nStatut: ${order.status}\n\nProduits commandés:\n${order.items.map(item => `${item.productName} x${item.quantity} (${item.unitPrice}€)`).join('\n')}`);
          return;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des commandes locales:', e);
      }
    }
    
    // Sinon, naviguer vers la page de détails (pour les commandes de l'API)
    navigate(`/order/${orderId}`);
  }, [navigate]);
  
  return (
    <div className="user-dashboard">
      <Header cart={cart} />
      
      <div className="dashboard-container">
        <div className="sidebar">
          <h2>Mon Compte</h2>
          <ul>
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profil
            </li>
            <li 
              className={activeTab === 'cart' ? 'active' : ''}
              onClick={() => setActiveTab('cart')}
            >
              Mon Panier ({cart.length})
            </li>
            <li 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              Mes Commandes
            </li>
            <li onClick={handleLogout}>Déconnexion</li>
          </ul>
        </div>
        
        <div className="content">
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-spinner">Chargement...</div>}
          
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2>Mon Profil</h2>
              <div className="profile-info">
                <p><strong>Nom:</strong> {user.lastName}</p>
                <p><strong>Prénom:</strong> {user.firstName}</p>
                <p><strong>Email:</strong> {user.email}</p>
  
              </div>
            </div>
          )}
          
          {activeTab === 'cart' && (
            <div className="cart-tab">
              <h2>
                Mon Panier
                {cart.length > 0 && (
                  <button 
                    className="empty-cart-btn"
                    onClick={clearCart}
                    disabled={loading}
                  >
                    Vider mon panier
                  </button>
                )}
              </h2>
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <p>Votre panier est vide.</p>
                  <button 
                    className="shop-now-btn"
                    onClick={() => navigate('/product')}
                  >
                    Découvrir nos produits
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    <table>
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Prix</th>
                          <th>Quantité</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(item => (
                          <tr key={item.id}>
                            <td>{item.product.name}</td>
                            <td>{item.product.price}€</td>
                            <td>
                              <div className="quantity-control">
                                <button 
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                  className="quantity-btn"
                                  disabled={loading}
                                >
                                  -
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                  className="quantity-btn"
                                  disabled={loading}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>{(item.product.price * item.quantity).toFixed(2)}€</td>
                            <td>
                              <button 
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                                disabled={loading}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="cart-summary">
                    <p className="total">
                      <strong>Total:</strong> 
                      {cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}€
                    </p>
                    <button 
                      className="checkout-btn"
                      onClick={checkout}
                      disabled={loading}
                    >
                      Valider ma commande
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h2>
                Mes Commandes
                <button 
                  className="refresh-orders-btn"
                  onClick={refreshOrders}
                  disabled={loading}
                >
                  ↻ Actualiser
                </button>
              </h2>
              {orders.length === 0 ? (
                <div className="no-orders">
                  <p>Vous n'avez pas encore passé de commande.</p>
                  <button 
                    className="shop-now-btn"
                    onClick={() => navigate('/product')}
                  >
                    Découvrir nos produits
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}€</td>
                          <td className="order-actions">
                            <button 
                              className="details-btn"
                              onClick={() => viewOrderDetails(order.id)}
                            >
                              Détails
                            </button>
                            {order.isClientOrder && (
                              <button 
                                className="delete-order-btn"
                                onClick={() => deleteOrder(order.id)}
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;