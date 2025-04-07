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

  // Récupérer les commandes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders', getAuthHeaders());
      console.log('Commandes récupérées:', response.data);
      setOrders(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      setError('Impossible de récupérer les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

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
      // Créer un FormData pour pouvoir envoyer le fichier image
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'image' && productData[key]) {
          formData.append('image', productData[key]);
        } else if (key !== 'image') {
          formData.append(key, productData[key]);
        }
      });

      const response = await axios.post(
        'http://localhost:5000/api/products',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Produit ajouté:', response.data);
      fetchProducts(); // Rafraîchir la liste des produits
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur lors de l\'ajout du produit:', err);
      setError('Impossible d\'ajouter le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de l\'ajout du produit' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, getToken]);

  // Mettre à jour un produit
  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    try {
      // Créer un FormData pour pouvoir envoyer le fichier image
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'image' && productData[key]) {
          formData.append('image', productData[key]);
        } else if (key !== 'image') {
          formData.append(key, productData[key]);
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Produit mis à jour:', response.data);
      fetchProducts(); // Rafraîchir la liste des produits
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      setError('Impossible de mettre à jour le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la mise à jour du produit' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, getToken]);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = useCallback(async (orderId, status) => {
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

  // Gérer la mise à jour du statut d'une commande
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
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

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    fetchProducts();
    fetchOrders();
    fetchUsers();
    if (showTrash) {
      fetchTrashedProducts();
    }
  };

  // Basculer l'affichage de la corbeille
  const toggleTrashView = () => {
    const newTrashState = !showTrash;
    setShowTrash(newTrashState);
    if (newTrashState) {
      fetchTrashedProducts();
    }
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
          <div className="header-actions">
            <button className="refresh-btn" onClick={refreshData} disabled={loading}>
              ↻ Actualiser
            </button>
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
                              <td>{product.price !== undefined ? `${parseFloat(product.price.price).toFixed(2)}€` : 'Prix N/A'}</td>
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
                <h2>Gestion des Commandes ({orders.length})</h2>
                
                {orders.length === 0 ? (
                  <p className="empty-message">Aucune commande disponible</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Produits</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>
                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Utilisateur inconnu'}
                            <br />
                            <small>{order.user?.email}</small>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            {order.orderItems ? (
                              <ul className="order-items-list">
                                {order.orderItems.map((item, index) => (
                                  <li key={index}>
                                    {item.product?.name || 'Produit inconnu'} x{item.quantity}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              'Aucun détail disponible'
                            )}
                          </td>
                          <td>{order.totalAmount}€</td>
                          <td>
                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              disabled={loading}
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