// src/components/JS/PaymentPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../CSS/PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [errors, setErrors] = useState({});

  // Récupérer les détails de la commande depuis l'état de navigation
  const orderDetails = location.state?.orderDetails || { 
    totalAmount: 0,
    items: []
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Numéro de carte invalide. Saisissez 16 chiffres sans espaces.';
    }
    
    if (!cardName.trim()) {
      newErrors.cardName = 'Nom sur la carte requis.';
    }
    
    if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.cardExpiry = 'Date d\'expiration invalide. Format: MM/AA';
    }
    
    if (!cardCVC.match(/^\d{3}$/)) {
      newErrors.cardCVC = 'Code CVC invalide. Saisissez 3 chiffres.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simuler un temps de traitement du paiement
    setTimeout(() => {
      // Rediriger vers la page de confirmation
      navigate('/confirmation', { 
        state: { 
          orderDetails,
          paymentMethod: 'Carte'
        } 
      });
    }, 2000);
  };

  const formatCardNumber = (value) => {
    // Supprimer tous les espaces et garder uniquement les chiffres
    const numbers = value.replace(/\D/g, '');
    // Limiter à 16 chiffres
    return numbers.substring(0, 16);
  };

  const formatCardExpiry = (value) => {
    // Supprimer tous les caractères non numériques et /
    const cleaned = value.replace(/[^\d/]/g, '');
    
    // Si moins de 2 caractères, laisser tel quel
    if (cleaned.length < 2) {
      return cleaned;
    }
    
    // Après 2 caractères, ajouter un /
    if (cleaned.indexOf('/') === -1 && cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    return cleaned.substring(0, 5);
  };

  return (
    <div className="payment-page">
      <Header />
      <div className="payment-container">
        <h1>Paiement de votre commande</h1>
        
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
          <div className="order-total">
            <span>Total:</span>
            <span className="total-amount">{orderDetails.totalAmount.toFixed(2)}€</span>
          </div>
        </div>
        
        <div className="payment-form-container">
          <h2>Informations de paiement</h2>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardName">Nom sur la carte</label>
              <input
                type="text"
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="JEAN DUPONT"
              />
              {errors.cardName && <div className="error-message">{errors.cardName}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="cardNumber">Numéro de carte</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234567890123456"
                maxLength="16"
              />
              {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="cardExpiry">Date d'expiration</label>
                <input
                  type="text"
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength="5"
                />
                {errors.cardExpiry && <div className="error-message">{errors.cardExpiry}</div>}
              </div>
              
              <div className="form-group half">
                <label htmlFor="cardCVC">CVC</label>
                <input
                  type="text"
                  id="cardCVC"
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  placeholder="123"
                  maxLength="3"
                />
                {errors.cardCVC && <div className="error-message">{errors.cardCVC}</div>}
              </div>
            </div>
            
            <div className="secure-payment-notice">
              <i className="lock-icon">🔒</i>
              <span>Paiement 100% sécurisé</span>
            </div>
            
            <button 
              type="submit" 
              className="submit-payment-btn"
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : `Payer ${orderDetails.totalAmount.toFixed(2)}€`}
            </button>
            
            <button 
              type="button" 
              className="cancel-payment-btn"
              onClick={() => navigate('/dashboard?section=cart')}
              disabled={loading}
            >
              Annuler
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;