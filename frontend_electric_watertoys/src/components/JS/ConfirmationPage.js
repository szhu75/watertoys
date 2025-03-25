// src/components/JS/ConfirmationPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../CSS/ConfirmationPage.css';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [orderCreated, setOrderCreated] = useState(false);
  const [error, setError] = useState(null);
  
  // Récupérer les détails de la commande depuis l'état de navigation avec useMemo
  const orderDetails = useMemo(() => {
    return location.state?.orderDetails || { totalAmount: 0, items: [] };
  }, [location.state]);
  
  const paymentMethod = useMemo(() => {
    return location.state?.paymentMethod || 'Carte';
  }, [location.state]);
  
  // Générer un numéro de commande aléatoire
  const orderNumber = useMemo(() => {
    return Math.floor(100000 + Math.random() * 900000);
  }, []);
  
  // Générer une date de livraison estimée (entre 3 et 7 jours)
  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(3 + Math.random() * 5));
    return date;
  }, []);
  
  useEffect(() => {
    // Si l'utilisateur arrive sur cette page sans les détails de commande, le rediriger
    if (!location.state) {
      navigate('/dashboard');
      return;
    }
    
    // Simuler une commande côté client
    const simulateOrder = () => {
      try {
        // Obtenir les commandes existantes du localStorage ou initialiser un tableau vide
        const existingOrdersStr = localStorage.getItem('clientOrders');
        const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
        
        // Créer une nouvelle commande
        const newOrder = {
          id: orderNumber,
          orderDate: new Date().toISOString(),
          status: 'pending',
          totalAmount: orderDetails.totalAmount,
          items: orderDetails.items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity
          }))
        };
        
        // Ajouter la nouvelle commande
        existingOrders.push(newOrder);
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('clientOrders', JSON.stringify(existingOrders));
        localStorage.setItem('newOrderId', newOrder.id);
        localStorage.setItem('orderJustCreated', 'true');
        
        // Vider le panier (simulé)
        localStorage.setItem('cartCleared', 'true');
        
        setOrderCreated(true);
        console.log("Commande simulée créée avec succès", newOrder);
      } catch (error) {
        console.error("Erreur lors de la simulation de commande:", error);
        setError("Erreur lors de la création de la commande simulée");
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Simuler un délai de traitement
    setTimeout(() => {
      simulateOrder();
    }, 1500);
    
  }, [location.state, navigate, orderDetails, orderNumber]);
  
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };
  
  return (
    <div className="confirmation-page">
      <Header cart={[]} />
      <div className="confirmation-container">
        <div className="confirmation-box">
          <div className="success-icon">✓</div>
          <h1>Commande Confirmée</h1>
          <p className="thank-you-message">Merci pour votre commande !</p>
          
          {isProcessing ? (
            <div className="processing-message">
              <p>Traitement de votre commande en cours...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <p>Votre paiement a été accepté, mais un problème est survenu lors de l'enregistrement de votre commande.</p>
              <button 
                className="retry-button"
                onClick={() => navigate('/dashboard')}
              >
                Retourner au tableau de bord
              </button>
            </div>
          ) : (
            <>
              <div className="order-details">
                <div className="order-detail-row">
                  <span className="detail-label">Numéro de commande :</span>
                  <span className="detail-value">{orderNumber}</span>
                </div>
                <div className="order-detail-row">
                  <span className="detail-label">Date de commande :</span>
                  <span className="detail-value">{formatDate(new Date())}</span>
                </div>
                <div className="order-detail-row">
                  <span className="detail-label">Méthode de paiement :</span>
                  <span className="detail-value">{paymentMethod}</span>
                </div>
                <div className="order-detail-row">
                  <span className="detail-label">Montant total :</span>
                  <span className="detail-value important">{orderDetails.totalAmount.toFixed(2)}€</span>
                </div>
                <div className="order-detail-row">
                  <span className="detail-label">Livraison estimée :</span>
                  <span className="detail-value">{formatDate(deliveryDate)}</span>
                </div>
              </div>
              
              <div className="order-summary">
                <h2>Récapitulatif de votre commande</h2>
                <div className="order-items">
                  {orderDetails.items && orderDetails.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{(item.product.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="contact-info">
                <p>Un email de confirmation a été envoyé à votre adresse email.</p>
                <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  className="back-to-shop-btn"
                  onClick={() => navigate('/product')}
                >
                  Continuer vos achats
                </button>
                <button 
                  className="view-orders-btn"
                  onClick={() => navigate('/dashboard?section=orders&refresh=true')}
                >
                  Voir mes commandes
                </button>
              </div>
              
              <p className="redirect-notice">Cliquez sur "Voir mes commandes" pour consulter votre historique de commandes.</p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConfirmationPage;