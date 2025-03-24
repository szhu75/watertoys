import React from 'react';
import '../CSS/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-social-icons">
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
      </div>
      <p>Copyright © Water Toys France 2025 - All rights reserved</p>
    </footer>
  );
}

export default Footer;
