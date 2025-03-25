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
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la commande:', error);
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, navigate]);
  
  if (loading) {
    return <div className="loading">Chargement des détails de la commande...</div>;
  }
  
  if (!order) {
    return <div className="error">Cette commande n'existe pas ou vous n'y avez pas accès.</div>;
  }
  
  return (
    <div className="order-detail-page">
      <Header />
      
      <div className="order-detail-container">
        <div className="back-button">
          <button onClick={() => navigate('/dashboard')}>← Retour au tableau de bord</button>
        </div>
        
        <h1>Détails de la commande #{order.id}</h1>
        
        <div className="order-info">
          <div className="order-summary">
            <h2>Résumé de la commande</h2>
            <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Statut:</strong> {order.status}</p>
            <p><strong>Total:</strong> {order.totalAmount}€</p>
            {order.trackingNumber && (
              <p><strong>Numéro de suivi:</strong> {order.trackingNumber}</p>
            )}
          </div>
          
          <div className="shipping-info">
            <h2>Informations de livraison</h2>
            <p><strong>Adresse:</strong> {order.shippingAddress}</p>
            <p><strong>Méthode de paiement:</strong> {order.paymentMethod}</p>
          </div>
        </div>
        
        <div className="order-items">
          <h2>Articles</h2>
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
                  <td>{item.product.name}</td>
                  <td>{item.unitPrice}€</td>
                  <td>{item.quantity}</td>
                  <td>{item.subtotal}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetail;