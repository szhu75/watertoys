// src/components/JS/UserDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../CSS/UserDashboard.css';
import Header from './Header';
import Footer from './Footer';

// Fonction qui génère une signature pour une commande
const generateOrderSignature = (order) => {
  const items = order.items ? order.items.slice().sort((a, b) => {
    const aId = a.productId || (a.product && a.product.id) || 0;
    const bId = b.productId || (b.product && b.product.id) || 0;
    return aId - bId;
  }) : [];

  const signatureObj = {
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    items: items.map(item => ({
      productId: item.productId || (item.product && item.product.id) || null,
      quantity: item.quantity,
      price: item.unitPrice || (item.product && item.product.price) || null
    }))
  };
  return JSON.stringify(signatureObj);
};

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Dans UserDashboard.js

// Ajouter cette fonction pour vérifier les doublons avant de supprimer
const findAndDeleteAllDuplicates = useCallback(async (originalOrderId) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Trouver la commande originale
    const originalOrder = orders.find(order => order.id.toString() === originalOrderId.toString());
    if (!originalOrder) {
      setError("Commande introuvable");
      return false;
    }
    
    // Créer une signature unique pour cette commande
    const signature = generateOrderSignature(originalOrder);
    
    // Trouver toutes les commandes avec la même signature
    const duplicates = orders.filter(order => 
      order.id.toString() !== originalOrderId.toString() && 
      generateOrderSignature(order) === signature
    );
    
    console.log(`${duplicates.length} doublons trouvés pour la commande ${originalOrderId}`);
    
    // Supprimer tous les doublons
    for (const duplicate of duplicates) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${duplicate.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Commande dupliquée ${duplicate.id} supprimée avec succès`);
      } catch (err) {
        console.error(`Erreur lors de la suppression du doublon ${duplicate.id}:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la recherche et suppression des doublons:", error);
    return false;
  } finally {
    setLoading(false);
  }
}, [orders]);

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

  // Récupérer les commandes réelles issues de l'API avec déduplication par signature
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      let apiOrders = [];
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

      // Déduplication basée sur la signature des commandes
      const uniqueOrdersMap = new Map();
      apiOrders.forEach(order => {
        const signature = generateOrderSignature(order);
        if (!uniqueOrdersMap.has(signature)) {
          uniqueOrdersMap.set(signature, order);
        }
      });
      const uniqueOrders = Array.from(uniqueOrdersMap.values());
      
      // Trier par date décroissante (les plus récentes en premier)
      uniqueOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      setOrders(uniqueOrders);
      console.log("Total des commandes (API uniquement, uniques):", uniqueOrders.length);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setError('Impossible de récupérer vos commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une commande réelle et ses doublons basés sur la signature
const deleteRealOrder = useCallback(async (orderId) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.")) {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Récupérer l'objet commande à supprimer
      const orderToDelete = orders.find(o => o.id.toString() === orderId.toString());
      if (!orderToDelete) {
        alert("Commande introuvable.");
        return;
      }
      
      // Trouver tous les doublons de cette commande
      const signature = generateOrderSignature(orderToDelete);
      const duplicates = orders.filter(o => 
        generateOrderSignature(o) === signature
      );
      
      console.log(`Suppression de la commande ${orderId} et de ses ${duplicates.length - 1} doublons.`);
      
      // Supprimer tous les doublons y compris l'original
      let successCount = 0;
      for (const order of duplicates) {
        try {
          await axios.delete(`http://localhost:5000/api/orders/${order.id}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur lors de la suppression de la commande id ${order.id}:`, err);
          
          // Si c'est l'original qui a échoué, afficher une erreur spécifique
          if (order.id.toString() === orderId.toString()) {
            setError(`Impossible de supprimer la commande principale (ID: ${orderId})`);
          }
        }
      }
      
      // Rafraîchir la liste des commandes
      await fetchOrders();
      
      if (successCount > 0) {
        alert(`${successCount} commande(s) supprimée(s) avec succès!`);
      } else {
        setError("Aucune commande n'a pu être supprimée.");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      setError('Erreur lors de la suppression de la commande.');
    } finally {
      setLoading(false);
    }
  }
}, [fetchOrders, orders]);

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
      const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
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

  // Fonction pour voir les détails d'une commande réelle
  const viewOrderDetails = useCallback((orderId) => {
    navigate(`/order/${orderId}`);
  }, [navigate]);

  // Rafraîchir manuellement les commandes
  const refreshOrders = () => {
    console.log("Rafraîchissement manuel des commandes");
    fetchOrders();
  };

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
    
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    const refreshParam = searchParams.get('refresh');
    
    fetchCart();
    
    if (sectionParam === 'orders' && refreshParam === 'true') {
      setActiveTab('orders');
      console.log("Rafraîchissement des commandes demandé explicitement");
      fetchOrders();
      navigate('/dashboard', { replace: true });
    } else {
      fetchOrders();
      if (sectionParam === 'cart') {
        setActiveTab('cart');
        navigate('/dashboard', { replace: true });
      } else if (sectionParam === 'orders') {
        setActiveTab('orders');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, location, fetchOrders, fetchCart]);

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
                            
                            <button 
                              className="delete-order-btn"
                              onClick={() => deleteRealOrder(order.id)}
                              disabled={loading || (order.status && order.status !== 'pending')}
                              title={order.status && order.status !== 'pending' ? 
                                "Seules les commandes en attente peuvent être supprimées" : 
                                "Supprimer la commande"}
                            >
                              Supprimer
                            </button>
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
