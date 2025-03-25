import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Head from '../JS/Header';
import Footer from '../JS/Footer';
import '../CSS/Products.css';

const Products = () => {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [estConnecte, setEstConnecte] = useState(false);
  const navigate = useNavigate();

  // Fonction pour vérifier la validité du token
  const estTokenValide = useCallback((token) => {
    if (!token) return false;
    
    try {
      const decode = jwtDecode(token);
      return decode.exp > Math.floor(Date.now() / 1000);
    } catch (erreur) {
      console.error("Erreur lors du décodage du token:", erreur);
      return false;
    }
  }, []);

  // Récupérer le panier
  const recupererPanier = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token || !estTokenValide(token)) {
      setPanier([]);
      setEstConnecte(false);
      return;
    }

    try {
      console.log("Token utilisé pour récupérer le panier:", token);
      
      const reponse = await axios.get('http://localhost:5000/api/cart', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Réponse du serveur (panier):", reponse.data);
      
      setPanier(reponse.data.items || []);
      setEstConnecte(true);
    } catch (erreur) {
      console.error('Erreur lors du chargement du panier:', erreur);
      console.error('Détails de l\'erreur:', erreur.response?.data);
      
      // Gérer les erreurs d'authentification spécifiques
      if (erreur.response && erreur.response.status === 401) {
        // Token invalide ou expiré
        console.log("Token invalide ou expiré, déconnexion...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setPanier([]);
        setEstConnecte(false);
      }
    }
  }, [estTokenValide]);

  // Récupérer les produits
  const recupererProduits = useCallback(async () => {
    try {
      setChargement(true);
      const reponse = await axios.get('http://localhost:5000/api/products');
      
      // Assurer que les données sont un tableau
      const donneesProduits = Array.isArray(reponse.data) 
        ? reponse.data 
        : (reponse.data.products || []);
      
      setProduits(donneesProduits);
      setErreur(null);
    } catch (erreur) {
      console.error('Erreur lors du chargement des produits:', erreur);
      setErreur('Impossible de charger les produits. Veuillez réessayer.');
      setProduits([]);
    } finally {
      setChargement(false);
    }
  }, []);

  // Gestionnaire d'ajout au panier
  const ajouterAuPanier = useCallback(async (produit) => {
    // Vérifier à nouveau l'état de connexion
    const token = localStorage.getItem('token');
    
    if (!token || !estTokenValide(token)) {
      // Stocker l'ID du produit que l'utilisateur essaie d'ajouter
      localStorage.setItem('pendingProductId', produit.id);
      localStorage.setItem('redirectAfterLogin', '/product');
      alert("You must be logged in to add products to your cart");
      navigate('/login');
      return;
    }
    
    try {
      console.log("Token utilisé pour la requête:", token);
      console.log("URL de l'API:", 'http://localhost:5000/api/cart/items');
      console.log("Données envoyées:", { productId: produit.id, quantity: 1 });
      
      const response = await axios.post('http://localhost:5000/api/cart/items', {
        productId: produit.id,
        quantity: 1
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Réponse du serveur:", response.data);
      
      // Actualiser le panier après l'ajout
      recupererPanier();
      
      // Afficher un message de confirmation
      alert('Product successfully added to your cart!');
    } catch (erreur) {
      console.error('Erreur lors de l\'ajout au panier:', erreur);
      console.error('Détails de l\'erreur:', erreur.response?.data);
      
      if (erreur.response && erreur.response.status === 401) {
        // Token invalide ou expiré
        alert("Your session has expired. You will be redirected to the login page.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setEstConnecte(false);
        navigate('/login');
      } else {
        alert('Unable to add product to cart: ' + (erreur.response?.data?.message || erreur.message));
      }
    }
  }, [estTokenValide, navigate, recupererPanier]);

  // Vérifier l'état de connexion au chargement et à chaque changement de route
  useEffect(() => {
    const verifierConnexion = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      if (token && userInfo && estTokenValide(token)) {
        setEstConnecte(true);
        recupererPanier();  // Récupérer le panier si l'utilisateur est connecté
      } else {
        setEstConnecte(false);
        setPanier([]);
      }
    };
    
    verifierConnexion();
    recupererProduits();
    
  }, [estTokenValide, recupererPanier, recupererProduits]);

  // Vérifier si on vient de se connecter avec un produit en attente
  useEffect(() => {
    if (estConnecte) {
      const pendingProductId = localStorage.getItem('pendingProductId');
      const justLoggedIn = localStorage.getItem('justLoggedIn');
      
      if (pendingProductId && justLoggedIn === 'true') {
        // Trouver le produit correspondant
        const produitEnAttente = produits.find(p => p.id === parseInt(pendingProductId));
        
        if (produitEnAttente) {
          // Ajouter automatiquement le produit au panier
          ajouterAuPanier(produitEnAttente);
        }
        
        // Nettoyer les données temporaires immédiatement pour éviter les doublons
        localStorage.removeItem('pendingProductId');
        localStorage.removeItem('justLoggedIn');
      }
    }
  }, [estConnecte, produits, ajouterAuPanier]);

  // Produits factices au cas où la BD n'est pas disponible
  const produitsFictifs = [
    { 
      id: 1, 
      name: 'GOCYCLE', 
      description: 'Compact and foldable electric bike, perfect for urban use and beach areas. Innovative design with high performance.',
      price: 2999.99,
      imageUrl: '/images/gocycle.jpg'
    },
    { 
      id: 2, 
      name: 'POOLSTAR', 
      description: 'Electric board for pools and calm seas, ideal for beginners. Intuitive navigation with long-lasting battery.',
      price: 1499.99,
      imageUrl: '/images/poolstar.jpg'
    },
    { 
      id: 3, 
      name: 'ZAPATA', 
      description: 'High-performance flyboard for thrilling experiences. Rises up to 15 meters above water for an incomparable aerial adventure.',
      price: 3999.99,
      imageUrl: '/images/zapata.jpg'
    },
    { 
      id: 4, 
      name: 'SUBLUE', 
      description: 'Compact and powerful underwater scooter. Perfect for exploring marine depths, reaching down to 30 meters.',
      price: 1199.99,
      imageUrl: '/images/sublue.jpg'
    },
    { 
      id: 5, 
      name: 'TIWAL', 
      description: 'Portable inflatable sailboat that\'s easy to assemble. Offers performance and stability for all sailing levels.',
      price: 2499.99,
      imageUrl: '/images/tiwal.jpg'
    }
  ];

  // Choisir entre les produits réels ou factices
  const produitsAffiches = produits.length > 0 ? produits : produitsFictifs;

  return (
    <div className="products-container">
      <Head cart={panier} />
      <main className="products-main">
        <section className="introduction-product">
          <h1>Our Products</h1>
          <h2>Discover our incredible water toys!</h2>
          {estConnecte ? (
            <p className="user-status connected">You are connected</p>
          ) : (
            <p className="user-status not-connected">You are not connected</p>
          )}
        </section>
        
        {chargement ? (
          <div className="loading">Loading products...</div>
        ) : erreur ? (
          <div className="error-message">{erreur}</div>
        ) : (
          <section className="product-list">
            {produitsAffiches.map((produit) => (
              <div key={produit.id} className="product-item">
                <div className="product-image-container">
                  <img 
                    src={produit.imageUrl || `/images/${produit.name.toLowerCase()}.jpg`} 
                    alt={produit.name} 
                    className="product-image" 
                  />
                  {/* Description qui s'affiche au survol */}
                  <div className="product-description-overlay">
                    <p>{produit.description}</p>
                  </div>
                </div>
                <h3>{produit.name}</h3>
                <div className="product-info">
                  <p className="product-price">Price: {produit.price}€</p>
                  <button 
                    onClick={() => ajouterAuPanier(produit)}
                    className="add-to-cart-btn"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {/* {panier.length > 0 && (
          <div className="floating-cart-button">
            <button onClick={() => navigate('/dashboard')}>
              View cart ({panier.length} items)
            </button>
          </div>
        )} */}
      </main>
      <Footer />
    </div>
  );
};

export default Products;