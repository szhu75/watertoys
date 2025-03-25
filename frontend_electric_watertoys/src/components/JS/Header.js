import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/Header.css';

const Head = ({ cart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCart, setUserCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Utiliser le panier passé en props ou un tableau vide si non défini
    setUserCart(cart || []);
  }, [cart]);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleCartClick = (e) => {
    // Prevent the hover popup from interfering
    e.stopPropagation();
    
    if (isLoggedIn) {
      // Navigate directly to the cart section of the dashboard
      navigate('/dashboard?section=cart');
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  };

  const calculateTotalCartItems = () => {
    return userCart.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotalCartPrice = () => {
    return userCart.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2);
  };

  return (
    <header className="home-header">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/images/logo-lift.jpeg" alt="Logo" />
          <span className="site-title">Electric Water Toys</span>
        </div>
        <div className="nav-links-container">
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/product" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/location" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Locations
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="social-icons">
          <a href="http://instagram.com/efoil_cotedazur" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo_insta.PNG" alt="Instagram" className="social-icon" />
          </a>
          <a href="https://www.facebook.com/eFoilCotedAzur" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo_fb.PNG" alt="Facebook" className="social-icon" />
          </a>
          <a href="https://api.whatsapp.com/send?phone=3335305067" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo_whatsApp.PNG" alt="WhatsApp" className="social-icon" />
          </a>
          <a href="mailto:contact@efoilcotedazur.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo_mail.PNG" alt="Email" className="social-icon" />
          </a>
          <span className="separator">|</span>
          <div
            className="cart-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img 
              src="/images/logo_panier.PNG" 
              alt="Cart" 
              className="cart-icon" 
              onClick={handleCartClick}
            />
            {userCart.length > 0 && (
              <span className="cart-count">{calculateTotalCartItems()}</span>
            )}
            {isHovered && userCart.length > 0 && (
              <div className="cart-popup">
                <h4>Contenu du Panier :</h4>
                <ul>
                  {userCart.map((item, index) => (
                    <li key={index}>
                      {item.product.name} - {item.product.price}€ x {item.quantity}
                    </li>
                  ))}
                </ul>
                <div className="cart-popup-summary">
                  <p>Total: {calculateTotalCartPrice()}€</p>
                  <button 
                    className="view-cart-btn"
                    onClick={handleCartClick}
                  >
                    Voir mon panier
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="login-container"
            onClick={handleLoginClick}
          >
            <img 
              src="/images/inscription.PNG" 
              alt="Mon compte" 
              className="login-icon" 
            />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Head;