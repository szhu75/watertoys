import React, { useState } from 'react';
import Head from '../JS/Header';
import Footer from '../JS/Footer';
import '../CSS/Products.css';

const Products = () => {
  const products = [
    { id: 1, name: 'Jetboard électrique', price: 3500 },
    { id: 2, name: 'Scooter sous-marin', price: 1200 },
    { id: 3, name: 'Kayak électrique', price: 2500 },
    { id: 4, name: 'Paddleboard motorisé', price: 2200 },
  ];

  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const addToCart = (product) => {
    setCart([...cart, product]); // Ajoute un produit au panier
  };

  const handleValidateCart = () => {
    setShowPayment(true); // Affiche la fenêtre de paiement
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true); // Affiche le message de confirmation
    setCart([]); // Vide le panier après confirmation
    setShowPayment(false); // Ferme la fenêtre de paiement
  };

  // Calcul du total du panier
  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className="products-container">
      <Head />
      <main className="products-main">
        <section className="introduction-product">
          <h1>Nos Produits</h1>
          <h2>Découvrez nos incroyables jouets aquatiques !</h2>
        </section>
        {!showPayment && !orderConfirmed && (
          <>
            <section className="product-list">
              {products.map((product) => (
                <div key={product.id} className="product-item">
                  <h3>{product.name}</h3>
                  <p>Prix : {product.price}€</p>
                  <button onClick={() => addToCart(product)}>Ajouter au panier</button>
                </div>
              ))}
            </section>
            <section className="cart">
              <h2>Panier</h2>
              {cart.length > 0 ? (
                <>
                  <ul>
                    {cart.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.price}€
                      </li>
                    ))}
                  </ul>
                  {/* Montant total affiché ici */}
                  <p className="cart-total">Montant total : {totalPrice}€</p>
                  <button onClick={handleValidateCart} className="validate-cart-btn">
                    Valider le panier
                  </button>
                </>
              ) : (
                <p>Votre panier est vide.</p>
              )}
            </section>
          </>
        )}

        {showPayment && !orderConfirmed && (
          <section className="payment-window">
            <h2>Fenêtre de Paiement</h2>
            <p>Total à payer : {totalPrice}€</p>
            <button onClick={handleConfirmOrder} className="confirm-order-btn">
              Valider la commande
            </button>
          </section>
        )}

        {orderConfirmed && (
          <section className="order-confirmation">
            <h2>Commande Confirmée !</h2>
            <p>Merci pour votre achat. Votre commande est en cours de traitement.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
