// src/components/JS/UserDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../CSS/UserDashboard.css';
import Header from './Header';
import Footer from './Footer';

// Fonction qui génère une signature pour une commande
const generateOrderSignature = (order) => {
  const items = order.items
    ? order.items.slice().sort((a, b) => {
        const aId = a.productId || (a.product && a.product.id) || 0;
        const bId = b.productId || (b.product && b.product.id) || 0;
        return aId - bId;
      })
    : [];

  const signatureObj = {
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    items: items.map((item) => ({
      productId: item.productId || (item.product && item.product.id) || null,
      quantity: item.quantity,
      price: item.unitPrice || (item.product && item.product.price) || null,
    })),
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

  // Récupérer le panier de l'utilisateur
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log("Retrieving cart with token:", token);

      // Vérifier si le panier vient d'être vidé après une commande
      const cartCleared = localStorage.getItem('cartCleared');
      if (cartCleared === 'true') {
        console.log("Cart cleared after order placement");
        setCart([]);
        localStorage.removeItem('cartCleared');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Cart retrieved:", response.data);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error retrieving cart:', error);
      setError('Unable to retrieve your cart. Please try again.');
      
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
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
          console.log("Orders retrieved from API:", apiOrders);
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
      console.log("Total unique orders (API only):", uniqueOrders.length);
      
    } catch (error) {
      console.error('Error retrieving orders:', error);
      setError('Unable to retrieve your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une commande réelle et ses doublons basés sur la signature
  const deleteRealOrder = useCallback(async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action is irreversible.")) {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // Récupérer l'objet commande à supprimer
        const orderToDelete = orders.find(o => o.id.toString() === orderId.toString());
        if (!orderToDelete) {
          alert("Order not found.");
          return;
        }
        
        // Trouver tous les doublons de cette commande
        const signature = generateOrderSignature(orderToDelete);
        const duplicates = orders.filter(o => generateOrderSignature(o) === signature);
        
        console.log(`Deleting order ${orderId} and its ${duplicates.length - 1} duplicate(s).`);
        
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
            console.error(`Error deleting order id ${order.id}:`, err);
            
            // Si c'est l'original qui a échoué, afficher une erreur spécifique
            if (order.id.toString() === orderId.toString()) {
              setError(`Unable to delete the main order (ID: ${orderId})`);
            }
          }
        }
        
        // Rafraîchir la liste des commandes
        await fetchOrders();
        
        if (successCount > 0) {
          alert(`${successCount} order(s) successfully deleted!`);
        } else {
          setError("No orders could be deleted.");
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        setError('Error while deleting the order.');
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
      
      console.log(`Removing item ${itemId} from cart`);
      console.log("Request URL:", `http://localhost:5000/api/cart/items/${itemId}`);
      console.log("Using token:", token);
      
      const response = await axios.delete(
        `http://localhost:5000/api/cart/items/${itemId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Deletion response:", response.data);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError('Unable to remove the item. Please try again.');
      
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
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
      
      console.log(`Updating item ${itemId} quantity to ${newQuantity}`);
      console.log("Request URL:", `http://localhost:5000/api/cart/items/${itemId}`);
      console.log("Data sent:", { quantity: newQuantity });
      console.log("Using token:", token);
      
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
      
      console.log("Update response:", response.data);
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError('Unable to update the quantity. Please try again.');
      
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
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
    if (window.confirm("Are you sure you want to empty your cart?")) {
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
        alert('Your cart has been successfully emptied.');
      } catch (error) {
        console.error('Error emptying the cart:', error);
        setError('Unable to empty the cart. Please try again.');
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
      console.error('Error preparing payment:', error);
      setError('Error while preparing the payment. Please try again.');
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
    console.log("Manual refresh of orders");
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
      console.log("Explicit orders refresh requested");
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
          <h2>My Account</h2>
          <ul>
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </li>
            <li 
              className={activeTab === 'cart' ? 'active' : ''}
              onClick={() => setActiveTab('cart')}
            >
              My Cart ({cart.length})
            </li>
            <li 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
        
        <div className="content">
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-spinner">Loading...</div>}
          
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2>My Profile</h2>
              <div className="profile-info">
                <p><strong>Last Name:</strong> {user.lastName}</p>
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'cart' && (
            <div className="cart-tab">
              <h2>
                My Cart
                {cart.length > 0 && (
                  <button 
                    className="empty-cart-btn"
                    onClick={clearCart}
                    disabled={loading}
                  >
                    Empty My Cart
                  </button>
                )}
              </h2>
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <p>Your cart is empty.</p>
                  <button 
                    className="shop-now-btn"
                    onClick={() => navigate('/product')}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
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
                                Remove
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
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h2>
                My Orders
                <button 
                  className="refresh-orders-btn"
                  onClick={refreshOrders}
                  disabled={loading}
                >
                  ↻ Refresh
                </button>
              </h2>
              {orders.length === 0 ? (
                <div className="no-orders">
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    className="shop-now-btn"
                    onClick={() => navigate('/product')}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
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
                              Details
                            </button>
                            
                            <button 
                              className="delete-order-btn"
                              onClick={() => deleteRealOrder(order.id)}
                              disabled={loading || (order.status && order.status !== 'pending')}
                              title={order.status && order.status !== 'pending'
                                ? "Only pending orders can be deleted"
                                : "Delete order"}
                            >
                              Delete
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
