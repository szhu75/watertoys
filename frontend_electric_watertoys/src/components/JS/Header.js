import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/Header.css';

const Head = ({ cart }) => {
  const [isHovered, setIsHovered] = useState(false); // Gère le survol du panier
  const navigate = useNavigate(); // Hook pour naviguer

  return (
    <header className="home-header">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="images/logo-lift.jpeg" alt="Logo" />
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
            <img src="images/logo_insta.PNG" alt="Instagram" className="social-icon" />
          </a>
          <a href="https://www.facebook.com/eFoilCotedAzur" target="_blank" rel="noopener noreferrer">
            <img src="images/logo_fb.PNG" alt="Facebook" className="social-icon" />
          </a>
          <a href="https://api.whatsapp.com/send?phone=3335305067" target="_blank" rel="noopener noreferrer">
            <img src="images/logo_whatsApp.PNG" alt="WhatsApp" className="social-icon" />
          </a>
          <a href="mailto:contact@efoilcotedazur.com" target="_blank" rel="noopener noreferrer">
            <img src="images/logo_mail.PNG" alt="Email" className="social-icon" />
          </a>
          <span className="separator">|</span>
          <div
            className="cart-container"
            onMouseEnter={() => setIsHovered(true)} // Affiche le contenu au survol
            onMouseLeave={() => setIsHovered(false)} // Cache le contenu en quittant le survol
          >
            <img src="images/logo_panier.PNG" alt="Cart" className="cart-icon" />
            {isHovered && cart?.length > 0 && ( // Affiche le contenu si le panier n'est pas vide
              <div className="cart-popup">
                <h4>Contenu du Panier :</h4>
                <ul>
                  {cart.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.price}€
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Remplacement du bouton par une image */}
          <div
            className="login-container"
            onClick={() => navigate('/login')} // Redirige vers la page de connexion ou d'inscription
          >
            <img src="images/inscription.PNG" alt="Login" className="login-icon" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Head;
