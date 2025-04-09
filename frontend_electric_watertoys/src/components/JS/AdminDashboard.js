// src/components/JS/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../JS/Footer';
import Head from '../JS/Header';
import '../CSS/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  
  // États pour gérer les données
  const [products, setProducts] = useState([]);
  const [trashedProducts, setTrashedProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [lastDeletedProduct, setLastDeletedProduct] = useState(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);

  // États pour le formulaire d'ajout de produit
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    description: '',
    image: null
  });

  // États pour le mode édition
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Récupérer les informations de l'utilisateur
  const [user, setUser] = useState({});

  // Fonction pour valider le token administrateur
  const validateAdminToken = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log("Validation du token administrateur:");
    console.log("Token présent:", !!token);
    console.log("Utilisateur:", user);
    console.log("Est admin selon localStorage:", user.isAdmin === true || user.role === 'admin');
    
    if (!token) {
      console.error("Token manquant - Déconnexion nécessaire");
      return false;
    }
    
    try {
      // Décoder manuellement le token pour vérifier (ne pas utiliser en production)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Format de token invalide");
        return false;
      }
      
      const decodedBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedStr = atob(decodedBase64);
      const payload = JSON.parse(decodedStr);
      
      console.log("Payload du token:", payload);
      console.log("Le token contient isAdmin:", payload.isAdmin === true);
      console.log("Le token contient le rôle admin:", payload.role === 'admin');
      
      return payload.isAdmin === true || payload.role === 'admin';
    } catch (err) {
      console.error("Erreur lors du décodage du token:", err);
      return false;
    }
  };

  // Fonction pour récupérer le token JWT - mémorisée pour éviter les recréations à chaque rendu
  const getToken = useCallback(() => localStorage.getItem('token'), []);
  
  // Configuration des headers pour les requêtes API
  const getAuthHeaders = useCallback(() => ({
    headers: { 
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  }), [getToken]);

  // Récupérer les produits actifs
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', getAuthHeaders());
      console.log('Produits actifs récupérés:', response.data);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      setError('Impossible de récupérer les produits. Veuillez réessayer.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Récupérer les produits dans la corbeille
  const fetchTrashedProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products/trash/all', getAuthHeaders());
      console.log('Produits dans la corbeille récupérés:', response.data);
      setTrashedProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des produits supprimés:', err);
      setError('Impossible de récupérer les produits supprimés. Veuillez réessayer.');
      setTrashedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories/all');
      console.log('Catégories récupérées:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
    }
  }, []);

  // Fonction de débogage pour les commandes
  const debugOrders = () => {
    console.log("Statut de loading:", loading);
    console.log("Erreur:", error);
    console.log("Tableau des commandes:", orders);
    console.log("Utilisateur actuel:", user);
    console.log("Est admin?", user.isAdmin);
    
    // Tester l'API directement
    const token = localStorage.getItem('token');
    console.log("Token actuel:", token);
    
    // Essayer explicitement la route de débogage
    axios.get('http://localhost:5000/api/orders/debug/all', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('TEST API - Commandes récupérées:', response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setOrders(response.data);
      } else {
        console.log("Aucune commande trouvée via débogage");
        
        // Utiliser des données de test si nécessaire
        const testOrders = [{
          id: 336398,
          user: {
            firstName: 'Clément',
            lastName: 'Bounadi',
            email: 'test123@gmail.com'
          },
          totalAmount: 4199.99,
          status: 'pending',
          orderDate: '2025-04-07'
        }];
        
        console.log('Données de test utilisées:', testOrders);
        setOrders(testOrders);
      }
    })
    .catch(err => {
      console.error('TEST API - Erreur route debug:', err.response ? err.response.data : err.message);
      
      // Si la route de débogage échoue, essayer la route principale
      axios.get('http://localhost:5000/api/orders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('TEST API (route principale) - Commandes récupérées:', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setOrders(response.data);
        }
      })
      .catch(mainErr => {
        console.error('TEST API - Erreur route principale:', mainErr.response ? mainErr.response.data : mainErr.message);
      });
    });
  };

  // Récupérer les commandes - version améliorée
// Section à remplacer dans AdminDashboard.js pour la gestion des commandes
const fetchOrders = useCallback(async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token manquant. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    // Utiliser la route principale pour les admins
    const response = await axios.get('http://localhost:5000/api/orders', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Commandes récupérées avec succès:', response.data);
    
    if (Array.isArray(response.data)) {
      setOrders(response.data);
      setError(null);
    } else {
      console.error("Format de données invalide:", response.data);
      setError("Format de données invalide reçu du serveur");
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    const errorMsg = error.response 
      ? `Erreur: ${error.response.status} - ${error.response.data.message || 'Erreur serveur'}`
      : "Le serveur ne répond pas. Vérifiez votre connexion.";
    
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
}, []);

  // Récupérer les utilisateurs
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users', getAuthHeaders());
      console.log('Utilisateurs récupérés:', response.data);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Impossible de récupérer les utilisateurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Mettre un produit à la corbeille
  const trashProduct = useCallback(async (productId) => {
    if (!window.confirm('Voulez-vous mettre ce produit à la corbeille ?')) {
      return { success: false };
    }
    
    setLoading(true);
    try {
      // Trouver le produit pour pouvoir l'annuler rapidement
      const productToTrash = products.find(p => p.id === productId);
      
      const response = await axios.put(
        `http://localhost:5000/api/products/${productId}/trash`, 
        {}, 
        getAuthHeaders()
      );
      
      console.log('Produit mis à la corbeille:', response.data);
      
      // Configuration pour l'annulation rapide
      setLastDeletedProduct(productToTrash);
      setShowUndoNotification(true);
      
      // Masquer la notification après 10 secondes
      setTimeout(() => {
        setShowUndoNotification(false);
        setLastDeletedProduct(null);
      }, 10000);
      
      // Rafraîchir les listes
      fetchProducts();
      
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à la corbeille du produit:', err);
      setError('Impossible de mettre le produit à la corbeille. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la mise à la corbeille' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, products, getAuthHeaders]);

  // Restaurer un produit depuis la corbeille
  const restoreProduct = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${productId}/restore`, 
        {}, 
        getAuthHeaders()
      );
      
      console.log('Produit restauré:', response.data);
      
      // Rafraîchir les deux listes
      fetchProducts();
      fetchTrashedProducts();
      
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la restauration du produit:', err);
      setError('Impossible de restaurer le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la restauration' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchTrashedProducts, getAuthHeaders]);

  // Annuler la dernière suppression
  const undoDelete = useCallback(() => {
    if (!lastDeletedProduct) return;
    
    restoreProduct(lastDeletedProduct.id);
    setShowUndoNotification(false);
    setLastDeletedProduct(null);
  }, [lastDeletedProduct, restoreProduct]);

  // Supprimer définitivement un produit
  const permanentlyDeleteProduct = useCallback(async (productId) => {
    if (!window.confirm('ATTENTION: Cette action est irréversible. Voulez-vous supprimer définitivement ce produit ?')) {
      return { success: false };
    }
    
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        getAuthHeaders()
      );
      
      console.log('Produit supprimé définitivement:', productId);
      
      // Rafraîchir la liste des produits dans la corbeille
      fetchTrashedProducts();
      
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression définitive du produit:', err);
      setError('Impossible de supprimer définitivement le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la suppression définitive' };
    } finally {
      setLoading(false);
    }
  }, [fetchTrashedProducts, getAuthHeaders]);

  // Vider la corbeille
  const emptyTrash = useCallback(async () => {
    if (!window.confirm('ATTENTION: Cette action est irréversible. Voulez-vous vider toute la corbeille ?')) {
      return { success: false };
    }
    
    setLoading(true);
    try {
      const response = await axios.delete(
        'http://localhost:5000/api/products/trash/empty',
        getAuthHeaders()
      );
      
      console.log('Corbeille vidée:', response.data);
      setTrashedProducts([]);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors du vidage de la corbeille:', err);
      setError('Impossible de vider la corbeille. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors du vidage de la corbeille' };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Ajouter un nouveau produit
  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    try {
      console.log("Données du produit à ajouter:", productData);
      
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price.toString());
      formData.append('stock', productData.stock.toString());
      formData.append('categoryId', productData.categoryId.toString());
      
      // Ajouter l'image seulement si elle existe
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
        console.log("Image ajoutée:", productData.image.name);
      }
  
      // Debug du FormData
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
  
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/products',
        data: formData,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Produit ajouté:', response.data);
      fetchProducts();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur lors de l\'ajout du produit:', err);
      if (err.response && err.response.data) {
        console.error('Détails de l\'erreur:', err.response.data);
      }
      setError('Impossible d\'ajouter le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de l\'ajout du produit' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, getToken]);

  // Mettre à jour un produit
  const updateProduct = async (productId, productData) => {
    setLoading(true);
    try {
      console.log("Mise à jour du produit ID:", productId);
      console.log("Données à envoyer:", productData);
      
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price.toString());
      formData.append('stock', productData.stock.toString());
      formData.append('categoryId', productData.categoryId.toString());
      
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
        console.log("Image ajoutée pour mise à jour:", productData.image.name);
      }
  
      // Utilisation de l'API Axios avec une configuration plus explicite
      const response = await axios({
        method: 'put',
        url: `http://localhost:5000/api/products/${productId}`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Produit mis à jour:', response.data);
      fetchProducts();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      if (err.response && err.response.data) {
        console.error('Détails de l\'erreur:', err.response.data);
      }
      setError('Impossible de mettre à jour le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la mise à jour du produit' };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une commande
  const handleUpdateOrderStatus = useCallback(async (orderId, status) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`, 
        { status },
        getAuthHeaders()
      );
      
      console.log('Statut de commande mis à jour:', response.data);
      fetchOrders(); // Rafraîchir la liste des commandes
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut de la commande:', err);
      setError('Impossible de mettre à jour le statut de la commande. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la mise à jour du statut' };
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, getAuthHeaders]);

  // Vérifier l'authentification et charger les données au démarrage
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    // Vérifier si l'utilisateur est admin
    if (!(userInfo.role === 'admin' || userInfo.isAdmin === true)) {
      // Rediriger vers le tableau de bord utilisateur si ce n'est pas un admin
      navigate('/dashboard');
      return;
    }
    
    setUser(userInfo);
    
    // Valider le token admin
    const isValidAdmin = validateAdminToken();
    console.log("Validation admin:", isValidAdmin);
    
    // Charger les données initiales
    fetchProducts();
    fetchCategories();
    fetchOrders();
    fetchUsers();
  }, [navigate, fetchProducts, fetchCategories, fetchOrders, fetchUsers]);

  // Gestion des changements dans le formulaire de nouveau produit
  const handleNewProductChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setNewProduct(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Ajouter ou mettre à jour un produit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const productData = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    };

    let result;
    
    // Mode édition ou ajout
    if (editingProduct) {
      // Mettre à jour un produit existant
      result = await updateProduct(editingProduct.id, productData);
    } else {
      // Ajouter un nouveau produit
      result = await addProduct(productData);
    }

    if (result.success) {
      // Réinitialiser le formulaire
      setNewProduct({
        name: '',
        price: '',
        stock: '',
        categoryId: '',
        description: '',
        image: null
      });
      setEditingProduct(null);
    } else {
      alert(result.error || 'Une erreur est survenue');
    }
  };

  // Début de l'édition d'un produit
  const handleEditProduct = (product) => {
    // Vérification explicite de la structure du produit
    const safeProduct = {
      id: product.id || null,
      name: product.name || '',
      price: product.price !== undefined ? product.price.toString() : '',
      stock: product.stock !== undefined ? product.stock.toString() : '',
      categoryId: product.categoryId || (product.category ? product.category.id : ''),
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    };
  
    console.log('Produit à éditer:', safeProduct);
  
    setEditingProduct(safeProduct);
    setNewProduct({
      name: safeProduct.name,
      price: safeProduct.price,
      stock: safeProduct.stock,
      categoryId: safeProduct.categoryId,
      description: safeProduct.description,
      image: null // L'image doit être rechargée si nécessaire
    });
  };

  // Gérer la mise à la corbeille d'un produit
  const handleTrashProduct = async (productId) => {
    await trashProduct(productId);
  };

  // Gérer la restauration d'un produit
  const handleRestoreProduct = async (productId) => {
    await restoreProduct(productId);
  };

  // Gérer la suppression définitive d'un produit
  const handlePermanentlyDeleteProduct = async (productId) => {
    await permanentlyDeleteProduct(productId);
  };

  // Gérer le vidage de la corbeille
  const handleEmptyTrash = async () => {
    await emptyTrash();
  };

  // Gérer le retour à la page précédente
  const handleGoBack = () => {
    navigate('/');
  };
  
  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // // Fonction pour rafraîchir les données
  // const refreshData = () => {
  //   fetchProducts();
  //   fetchOrders();
  //   fetchUsers();
  //   if (showTrash) {
  //     fetchTrashedProducts();
  //   }
  // };

  // Basculer l'affichage de la corbeille
  const toggleTrashView = () => {
    const newTrashState = !showTrash;
    setShowTrash(newTrashState);
    if (newTrashState) {
      fetchTrashedProducts();
    }
  };

  // Voir les détails d'une commande
  const viewOrderDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div>
      <Head />
      <div className="admin-dashboard">
        <header className="admin-header">
          <div className="header-left">
            <button className="back-btn" onClick={handleGoBack}>
              <i className="arrow-icon">←</i>
            </button>
            <h1>Tableau de Bord Administrateur</h1>
          </div>
        </header>

        <div className="dashboard-layout">
          <div className="sidebar">
            <h2>Menu Admin</h2>
            <ul>
              <li 
                className={activeSection === 'profile' ? 'active' : ''}
                onClick={() => setActiveSection('profile')}
              >
                Profil
              </li>
              <li 
                className={activeSection === 'products' ? 'active' : ''}
                onClick={() => setActiveSection('products')}
              >
                Gestion Produits
              </li>
              <li 
                className={activeSection === 'orders' ? 'active' : ''}
                onClick={() => setActiveSection('orders')}
              >
                Gestion Commandes
              </li>
              <li 
                className={activeSection === 'users' ? 'active' : ''}
                onClick={() => setActiveSection('users')}
              >
                Utilisateurs
            </li>
              <li onClick={handleLogout}>
                Déconnexion
              </li>
            </ul>
          </div>

          <div className="dashboard-content">
            {loading && <div className="loading-indicator">Chargement en cours...</div>}
            {error && <div className="error-message">{error}</div>}
            
            {/* Notification d'annulation */}
            {showUndoNotification && (
              <div className="undo-notification">
                <span>Produit mis à la corbeille : {lastDeletedProduct?.name}</span>
                <button onClick={undoDelete}>Annuler</button>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="profile-section">
                <h2>Mon Profil Administrateur</h2>
                <div className="profile-info">
                  <p><strong>Nom:</strong> {user.lastName}</p>
                  <p><strong>Prénom:</strong> {user.firstName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rôle:</strong> Administrateur</p>
              
                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <section className="products-management">
                <div className="products-header">
                  <h2>Gestion des Produits</h2>
                  <button 
                    className={`trash-toggle-btn ${showTrash ? 'active' : ''}`} 
                    onClick={toggleTrashView}
                  >
                    {showTrash ? 'Produits actifs' : `Corbeille (${trashedProducts.length})`}
                  </button>
                </div>
                
                {!showTrash ? (
                  <>
                    <form onSubmit={handleAddProduct} className="product-form">
                      <h3>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</h3>
                      
                      <div className="form-row">
                        <input
                          type="text"
                          name="name"
                          value={newProduct.name}
                          onChange={handleNewProductChange}
                          placeholder="Nom du Produit"
                          required
                        />
                        <input
                          type="number"
                          name="price"
                          value={newProduct.price}
                          onChange={handleNewProductChange}
                          placeholder="Prix"
                          required
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div className="form-row">
                        <input
                          type="number"
                          name="stock"
                          value={newProduct.stock}
                          onChange={handleNewProductChange}
                          placeholder="Stock"
                          required
                          min="0"
                        />
                        <select
                          name="categoryId"
                          value={newProduct.categoryId}
                          onChange={handleNewProductChange}
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        placeholder="Description du produit"
                        required
                      />
                      
                      <div className="form-row">
                        <input
                          type="file"
                          name="image"
                          onChange={handleNewProductChange}
                          accept="image/jpeg,image/png,image/gif,image/webp"
                        />
                        {editingProduct && editingProduct.imageUrl && (
                          <div className="current-image">
                            <span>Image actuelle:</span>
                            <img 
                              src={editingProduct.imageUrl} 
                              alt={editingProduct.name} 
                              width="100" 
                            />
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                          {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                        
                        {editingProduct && (
                          <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => {
                              setEditingProduct(null);
                              setNewProduct({
                                name: '',
                                price: '',
                                stock: '',
                                categoryId: '',
                                description: '',
                                image: null
                              });
                            }}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="product-list">
                      <h3>Liste des Produits ({products.length})</h3>
                      {products.length === 0 ? (
                        <p className="empty-message">Aucun produit disponible</p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Nom</th>
                              <th>Prix</th>
                              <th>Stock</th>
                              <th>Catégorie</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(product => {
                              // Validation supplémentaire
                              if (!product || typeof product !== 'object') {
                                console.error('Produit invalide:', product);
                                return null;
                              }

                              return (
                                <tr key={product.id || Math.random()}>
                                  <td>
                                    {product.imageUrl ? (
                                      <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        width="50" 
                                        height="50"
                                        style={{ objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <span>Aucune image</span>
                                    )}
                                  </td>
                                  <td>{product.name || 'Nom inconnu'}</td>
                                  <td>{product.price !== undefined ? `${parseFloat(product.price).toFixed(2)}€` : 'Prix N/A'}</td>
                                  <td>{product.stock !== undefined ? product.stock : 'Stock N/A'}</td>
                                  <td>{product.category ? product.category.name : 'Catégorie N/A'}</td>
                                  <td>
                                    <button 
                                      className="edit-btn"
                                      onClick={() => handleEditProduct(product)}
                                      disabled={loading}
                                    >
                                      Éditer
                                    </button>
                                    <button 
                                      className="trash-btn"
                                      onClick={() => handleTrashProduct(product.id)}
                                      disabled={loading}
                                    >
                                      Corbeille
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                ) : (
                  // Interface de la corbeille
                  <div className="trash-section">
                    <div className="trash-header">
                      <h3>Corbeille ({trashedProducts.length} produits)</h3>
                      {trashedProducts.length > 0 && (
                        <button 
                          className="empty-trash-btn"
                          onClick={handleEmptyTrash}
                          disabled={loading}
                        >
                          Vider la corbeille
                        </button>
                      )}
                    </div>
                    
                    {trashedProducts.length === 0 ? (
                      <p className="empty-message">La corbeille est vide</p>
                    ) : (
                      <table className="trash-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Prix</th>
                            <th>Catégorie</th>
                            <th>Date de suppression</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trashedProducts.map(product => (
                            <tr key={product.id}>
                              <td>
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    width="50" 
                                    height="50"
                                    style={{ objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span>Aucune image</span>
                                )}
                              </td>
                              <td>{product.name}</td>
                              <td>{product.price !== undefined ? `${parseFloat(product.price).toFixed(2)}€` : 'Prix N/A'}</td>
                              <td>{product.category ? product.category.name : 'Catégorie N/A'}</td>
                              <td>
                                {product.deletedAt 
                                  ? new Date(product.deletedAt).toLocaleString() 
                                  : 'Date inconnue'}
                              </td>
                              <td>
                                <button 
                                  className="restore-btn"
                                  onClick={() => handleRestoreProduct(product.id)}
                                  disabled={loading}
                                >
                                  Restaurer
                                </button>
                                <button 
                                  className="permanent-delete-btn"
                                  onClick={() => handlePermanentlyDeleteProduct(product.id)}
                                  disabled={loading}
                                >
                                  Supprimer définitivement
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </section>
            )}

{activeSection === 'orders' && (
  <section className="orders-management">
    <h2>Gestion des Commandes</h2>
    <div className="section-header">
      <button 
        className="refresh-btn" 
        onClick={fetchOrders}
        disabled={loading}
      >
        ↻ Actualiser les commandes
      </button>
    </div>

    {loading && <div className="loading-indicator">Chargement des commandes...</div>}
    
    {error && (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchOrders}>Réessayer</button>
      </div>
    )}

    {!loading && !error && orders.length === 0 ? (
      <div className="empty-message">
        <p>Aucune commande disponible</p>
        <p className="small-text">Les commandes passées par les utilisateurs apparaîtront ici.</p>
      </div>
    ) : (
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  {order.user ? (
                    <>
                      <div>{order.user.firstName} {order.user.lastName}</div>
                      <small>{order.user.email}</small>
                    </>
                  ) : (
                    'Utilisateur inconnu'
                  )}
                </td>
                <td>
                  {order.orderDate ? 
                    new Date(order.orderDate).toLocaleDateString('fr-FR') : 
                    new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  {typeof order.totalAmount === 'number' 
                    ? order.totalAmount.toFixed(2) 
                    : parseFloat(order.totalAmount).toFixed(2)}€
                </td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status === 'pending' ? 'En attente' : 
                     order.status === 'processing' ? 'En traitement' : 
                     order.status === 'shipped' ? 'Expédié' : 
                     order.status === 'delivered' ? 'Livré' : 
                     order.status === 'cancelled' ? 'Annulé' : order.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    Détails
                  </button>
                  <select 
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    disabled={loading}
                    className="status-select"
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

            {activeSection === 'users' && (
              <section className="users-management">
                <h2>Gestion des Utilisateurs ({users.length})</h2>

                {users.length === 0 ? (
                  <p className="empty-message">Aucun utilisateur disponible</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.isAdmin ? 'role-admin' : 'role-user'}`}>
                              {user.isAdmin ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;