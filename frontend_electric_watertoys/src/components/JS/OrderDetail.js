// src/components/JS/OrderDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/OrderDetail.css';
import Header from './Header';
import Footer from './Footer';

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // Vérifie si l'utilisateur est administrateur
  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && (user.isAdmin || user.role === 'admin');
  };
  
  // Récupère les détails de la commande
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // URL différente selon le rôle de l'utilisateur
        const endpoint = isAdmin() 
          ? `http://localhost:5000/api/orders/${orderId}` 
          : `http://localhost:5000/api/orders/${orderId}`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrder(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la commande:', error);
        setError('Impossible de récupérer les détails de la commande.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, navigate]);
  
  // Mettre à jour le statut de la commande (admin uniquement)
  const handleUpdateStatus = async (newStatus) => {
    if (!isAdmin()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mettre à jour l'état local
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Impossible de mettre à jour le statut de la commande.');
    } finally {
      setLoading(false);
    }
  };
  
  // Traduire le statut en français
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'shipped': 'Expédié',
      'delivered': 'Livré',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };
  
  // Formater une date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString || 'Date inconnue';
    }
  };
  
  if (loading) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="order-detail-container loading">
          <div className="loading-spinner">Chargement des détails de la commande...</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="order-detail-container error">
          <div className="back-button">
            <button onClick={() => navigate(isAdmin() ? '/admin-dashboard' : '/dashboard')}>
              ← Retour au tableau de bord
            </button>
          </div>
          <div className="error-message">
            {error || "Cette commande n'existe pas ou vous n'y avez pas accès."}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="order-detail-page">
      <Header />
      
      <div className="order-detail-container">
        <div className="back-button">
          <button onClick={() => navigate(isAdmin() ? '/admin-dashboard' : '/dashboard')}>
            ← Retour au tableau de bord
          </button>
        </div>
        
        <h1>Détails de la commande #{order.id}</h1>
        
        <div className="order-status">
          <span className={`status-badge status-${order.status}`}>
            {translateStatus(order.status)}
          </span>
          
          {isAdmin() && (
            <div className="status-control">
              <label>Modifier le statut:</label>
              <select 
                value={order.status} 
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={loading}
              >
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="order-info">
          <div className="order-summary">
            <h2>Résumé de la commande</h2>
            <p><strong>Date:</strong> {formatDate(order.orderDate || order.createdAt)}</p>
            <p><strong>Total:</strong> {parseFloat(order.totalAmount).toFixed(2)}€</p>
            <p><strong>Méthode de paiement:</strong> {order.paymentMethod || 'Non spécifiée'}</p>
            {order.trackingNumber && (
              <p><strong>Numéro de suivi:</strong> {order.trackingNumber}</p>
            )}
          </div>
          
          <div className="shipping-info">
            <h2>Informations de livraison</h2>
            {order.user && (
              <>
                <p><strong>Client:</strong> {order.user.firstName} {order.user.lastName}</p>
                <p><strong>Email:</strong> {order.user.email}</p>
              </>
            )}
            <p><strong>Adresse:</strong> {order.shippingAddress || 'Non spécifiée'}</p>
          </div>
        </div>
        
        <div className="order-items">
          <h2>Articles</h2>
          {order.items && order.items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="product-info">
                      {item.product ? (
                        <>
                          {item.product.imageUrl && (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="product-thumbnail" 
                            />
                          )}
                          <span>{item.product.name}</span>
                        </>
                      ) : (
                        <span>{item.productName || `Produit #${item.productId}`}</span>
                      )}
                    </td>
                    <td>{parseFloat(item.unitPrice).toFixed(2)}€</td>
                    <td>{item.quantity}</td>
                    <td>{parseFloat(item.subtotal || (item.unitPrice * item.quantity)).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">Total</td>
                  <td>{parseFloat(order.totalAmount).toFixed(2)}€</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="no-items">Aucun article trouvé pour cette commande.</p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetail;