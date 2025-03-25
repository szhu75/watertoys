import React from 'react';
import Head from '../JS/Header';
import Footer from '../JS/Footer';
import '../CSS/Locations.css';

const Locations = () => {
  const stores = [
    {
      city: "Cannes",
      name: "E-Foil France Cannes",
      address: "Port Pierre Canto, Allée de la Liberté, 06400 Cannes",
      phone: "+33 6 74 32 79 75",
      email: "contact@efoil-france.fr",
      website: "efoil-cannes.fr",
      websiteUrl: "https://efoil-cannes.fr/",
      hours: "By appointment",
      description: "Located in the heart of the French Riviera, our Cannes store offers the full range of water toys and professional guidance for your aquatic adventures.",
      image: "/images/port_canto.jpg"
    },
    {
      city: "Le Touquet",
      name: "E-Foil France Le Touquet",
      address: "Base Nautique Nord, Av. Jean Ruet, 62520 Le Touquet-Paris-Plage",
      phone: "+33 6 74 32 79 75",
      email: "contact@efoil-france.fr",
      website: "efoil-letouquet.fr",
      websiteUrl: "https://efoil-letouquet.fr/",
      hours: "By appointment",
      description: "Our Northern France flagship store, perfect for discovering water toys in the beautiful setting of Le Touquet-Paris-Plage.",
      image: "/images/paris-plage.jpg"
    },
    {
      city: "Arcachon",
      name: "E-Foil France Arcachon",
      address: "Av. du Figuier, 33115 La Teste-de-Buch",
      phone: "+33 6 74 32 79 75",
      email: "contact@efoil-france.fr",
      website: "efoil-arcachon.fr",
      websiteUrl: "https://efoil-arcachon.fr/",
      hours: "By appointment",
      description: "Experience our water toys in the magnificent Bay of Arcachon, known for its perfect conditions for water sports.",
      image: "/images/bassin_arcachon.jpg"
    }
  ];

  const handleCallClick = (phone) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  
  const handleWebsiteClick = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <div>
      <Head />
      <div className="locations-container">
        <section className="locations-header">
          <h1 className="locations-title">Our Locations</h1>
          <p className="locations-subtitle">
            Visit our E-Foil France stores to try and buy our electric Lift Foils and water toys
          </p>
        </section>
        
        <div className="stores-grid">
          {stores.map((store, index) => (
            <div key={index} className="store-card">
              <div className="store-image">
                <img src={store.image} alt={store.name} className="location-img" />
              </div>
              
              <div className="store-content">
                <h2 className="store-name">{store.name}</h2>
                <p className="store-description">{store.description}</p>
                
                <div className="store-details">
                  <div className="store-info">
                    <span className="icon">📍</span>
                    <p>{store.address}</p>
                  </div>
                  
                  <div className="store-info">
                    <span className="icon">📞</span>
                    <a href={`tel:${store.phone.replace(/\s/g, '')}`}>{store.phone}</a>
                  </div>
                  
                  <div className="store-info">
                    <span className="icon">✉️</span>
                    <a href={`mailto:${store.email}`}>{store.email}</a>
                  </div>
                  
                  <div className="store-info">
                    <span className="icon">🌐</span>
                    <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {store.website}
                    </a>
                  </div>
                  
                  <div className="store-info">
                    <span className="icon">⏰</span>
                    <p>{store.hours}</p>
                  </div>
                </div>

                <div className="store-actions">
                  <button 
                    onClick={() => handleWebsiteClick(store.websiteUrl)} 
                    className="action-button website-btn"
                  >
                    Visit Website
                  </button>
                  <button 
                    onClick={() => handleCallClick(store.phone)} 
                    className="action-button call-btn"
                  >
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <section className="locations-info">
          <div className="info-content">
            <h2>Visit Us Today</h2>
            <p>Book a test session or training at any of our locations. <br></br><br></br>Our expert staff will guide you through our product range and help you find the perfect water toy for your needs.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Locations;