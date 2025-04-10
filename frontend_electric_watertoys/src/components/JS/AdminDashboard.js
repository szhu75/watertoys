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

    console.log("Validation of the administrator token:");
    console.log("Token present:", !!token);
    console.log("User", user);
    console.log("Is admin according to localStorage :", user.isAdmin === true || user.role === 'admin');

    if (!token) {
      console.error("Missing Token - Logout Required");
      return false;
    }

    try {
      // Décoder manuellement le token pour vérifier (ne pas utiliser en production)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        return false;
      }

      const decodedBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedStr = atob(decodedBase64);
      const payload = JSON.parse(decodedStr);

      console.log("Token payload:", payload);
      console.log("Token contains isAdmin:", payload.isAdmin === true);
      console.log("Token contains admin role:", payload.role === 'admin');

      return payload.isAdmin === true || payload.role === 'admin';
    } catch (err) {
      console.error("Error decoding token:", err);
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
      console.log('Active products retrieved:', response.data);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error retrieving products:', err);
      setError('Unable to retrieve products. Please try again.');
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
      console.log('Trashed Products Recovered:', response.data);
      setTrashedProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error retrieving deleted products:', err);
      setError('Unable to retrieve deleted products. Please try again.');
      setTrashedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories/all');
      console.log('Categories retrieved:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Error retrieving categories:', err);
    }
  }, []);

  // Récupérer les commandes - version améliorée
  // Section à remplacer dans AdminDashboard.js pour la gestion des commandes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Missing token. Please log in again.");
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

      console.log('Orders successfully retrieved:', response.data);

      if (Array.isArray(response.data)) {
        setOrders(response.data);
        setError(null);
      } else {
        console.error("Invalid data format:", response.data);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error('Error retrieving commands:', error);
      const errorMsg = error.response
        ? `Error: ${error.response.status} - ${error.response.data.message || 'Server error'}`
        : "The server is not responding. Check your connection.";

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
      console.log('Users retrieved:', response.data);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error retrieving users:', err);
      setError('Unable to retrieve users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Mettre un produit à la corbeille
  const trashProduct = useCallback(async (productId) => {
    if (!window.confirm('Do you want to move this product to the trash?')) {
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

      console.log('Product moved to trash:', response.data);

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
      console.error('Error trashing product:', err);
      setError('Unable to trash product. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error trashing' };
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

      console.log('Product restored:', response.data);

      // Rafraîchir les deux listes
      fetchProducts();
      fetchTrashedProducts();

      return { success: true };
    } catch (err) {
      console.error('Error restoring product:', err);
      setError('Unable to restore the product. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error restoring' };
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
    if (!window.confirm('WARNING: This action is irreversible. Do you want to permanently delete this product?')) {
      return { success: false };
    }

    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        getAuthHeaders()
      );

      console.log('Product permanently deleted:', productId);

      // Rafraîchir la liste des produits dans la corbeille
      fetchTrashedProducts();

      return { success: true };
    } catch (err) {
      console.error('Error permanently deleting product:', err);
      setError('Unable to permanently delete the product. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error permanently deleting' };
    } finally {
      setLoading(false);
    }
  }, [fetchTrashedProducts, getAuthHeaders]);

  // Vider la corbeille
  const emptyTrash = useCallback(async () => {
    if (!window.confirm('WARNING: This action is irreversible. Do you want to empty the entire Trash?')) {
      return { success: false };
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        'http://localhost:5000/api/products/trash/empty',
        getAuthHeaders()
      );

      console.log('Trash emptied:', response.data);
      setTrashedProducts([]);
      return { success: true };
    } catch (err) {
      console.error('Error emptying Trash:', err);
      setError('Unable to empty Trash. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error emptying Trash' };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Ajouter un nouveau produit
  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    try {
      console.log("Product data to add:", productData);

      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price.toString());
      formData.append('stock', productData.stock.toString());
      formData.append('categoryId', productData.categoryId.toString());

      // Ajouter l'image seulement si elle existe
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
        console.log("Image added:", productData.image.name);
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

      console.log('Product added:', response.data);
      fetchProducts();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding product:', err);
      if (err.response && err.response.data) {
        console.error('Error details:', err.response.data);
      }
      setError('Unable to add product. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error adding product' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, getToken]);

  // Mettre à jour un produit
  const updateProduct = async (productId, productData) => {
    setLoading(true);
    try {
      console.log("Updating product ID:", productId);
      console.log("Data to send:", productData);

      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price.toString());
      formData.append('stock', productData.stock.toString());
      formData.append('categoryId', productData.categoryId.toString());

      if (productData.image instanceof File) {
        formData.append('image', productData.image);
        console.log("Image added for update:", productData.image.name);
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

      console.log('Product updated:', response.data);
      fetchProducts();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating product:', err);
      if (err.response && err.response.data) {
        console.error('Error details:', err.response.data);
      }
      setError('Unable to update product. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error updating product' };
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

      console.log('Order status updated:', response.data);
      fetchOrders(); // Refresh the list of orders
      return { success: true };
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Unable to update order status. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Error updating status' };
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
      alert('Please fill in all required fields');
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
      alert(result.error || 'An error has occurred');
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

    console.log('Product to edit:', safeProduct);

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
            <h1>Administrator Dashboard</h1>
          </div>
        </header>

        <div className="dashboard-layout">
          <div className="sidebar">
            <h2>Admin Menu</h2>
            <ul>
              <li
                className={activeSection === 'profile' ? 'active' : ''}
                onClick={() => setActiveSection('profile')}
              >
                Profile
              </li>
              <li
                className={activeSection === 'products' ? 'active' : ''}
                onClick={() => setActiveSection('products')}
              >
                Product Management
              </li>
              <li
                className={activeSection === 'orders' ? 'active' : ''}
                onClick={() => setActiveSection('orders')}
              >
                Order Management
              </li>
              <li
                className={activeSection === 'users' ? 'active' : ''}
                onClick={() => setActiveSection('users')}
              >
                Users
              </li>
              <li onClick={handleLogout}>
                Log out
              </li>
            </ul>
          </div>

          <div className="dashboard-content">
            {loading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Notification d'annulation */}
            {showUndoNotification && (
              <div className="undo-notification">
                <span>Product moved to trash: {lastDeletedProduct?.name}</span>
                <button onClick={undoDelete}>Undo</button>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="profile-section">
                <h2>My Administrator Profile</h2>
                <div className="profile-info">
                  <p><strong>Last Name:</strong> {user.lastName}</p>
                  <p><strong>First Name:</strong> {user.firstName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> Administrator</p>

                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <section className="products-management">
                <div className="products-header">
                  <h2>Product Management</h2>
                  <button
                    className={`trash-toggle-btn ${showTrash ? 'active' : ''}`}
                    onClick={toggleTrashView}
                  >
                    {showTrash ? 'Active Products' : `Trash (${trashedProducts.length})`}
                  </button>
                </div>

                {!showTrash ? (
                  <>
                    <form onSubmit={handleAddProduct} className="product-form">
                      <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>

                      <div className="form-row">
                        <input
                          type="text"
                          name="name"
                          value={newProduct.name}
                          onChange={handleNewProductChange}
                          placeholder="Product Name"
                          required
                        />
                        <input
                          type="number"
                          name="price"
                          value={newProduct.price}
                          onChange={handleNewProductChange}
                          placeholder="Price"
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
                          <option value="">Select a category</option>
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
                        placeholder="Product Description"
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
                            <span>Current image:</span>
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
                          {editingProduct ? 'Update' : 'Add'}
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
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="product-list">
                      <h3>Product List ({products.length})</h3>
                      {products.length === 0 ? (
                        <p className="empty-message">No products available</p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Category</th>
                              <th>Stocks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(product => {
                              // Validation supplémentaire
                              if (!product || typeof product !== 'object') {
                                console.error('Invalid product:', product);
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
                                      <span>No images</span>
                                    )}
                                  </td>
                                  <td>{product.name || 'Name unknown'}</td>
                                  <td>{product.price !== undefined ? `${parseFloat(product.price).toFixed(2)}€` : 'Price N/A'}</td>
                                  <td>{product.stock !== undefined ? product.stock : 'Stock N/A'}</td>
                                  <td>{product.category ? product.category.name : 'Category N/A'}</td>
                                  <td>
                                    <button
                                      className="edit-btn"
                                      onClick={() => handleEditProduct(product)}
                                      disabled={loading}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="trash-btn"
                                      onClick={() => handleTrashProduct(product.id)}
                                      disabled={loading}
                                    >
                                      Trash
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
                      <h3>Trash ({trashedProducts.length} products)</h3>
                      {trashedProducts.length > 0 && (
                        <button
                          className="empty-trash-btn"
                          onClick={handleEmptyTrash}
                          disabled={loading}
                        >
                          Empty the trash
                        </button>
                      )}
                    </div>

                    {trashedProducts.length === 0 ? (
                      <p className="empty-message">The trash is empty</p>
                    ) : (
                      <table className="trash-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Deletion Date</th>
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
                                  <span>No images</span>
                                )}
                              </td>
                              <td>{product.name}</td>
                              <td>{product.price !== undefined ? `${parseFloat(product.price).toFixed(2)}€` : 'Price N/A'}</td>
                              <td>{product.category ? product.category.name : 'Category N/A'}</td>
                              <td>
                                {product.deletedAt
                                  ? new Date(product.deletedAt).toLocaleString()
                                  : 'Date unknown'}
                              </td>
                              <td>
                                <button
                                  className="restore-btn"
                                  onClick={() => handleRestoreProduct(product.id)}
                                  disabled={loading}
                                >
                                  Restore
                                </button>
                                <button
                                  className="permanent-delete-btn"
                                  onClick={() => handlePermanentlyDeleteProduct(product.id)}
                                  disabled={loading}
                                >
                                  Permanently delete
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
                <h2>Order Management</h2>
                <div className="section-header">
                  <button
                    className="refresh-btn"
                    onClick={fetchOrders}
                    disabled={loading}
                  >
                    Refresh Orders
                  </button>
                </div>

                {loading && <div className="loading-indicator">Loading orders...</div>}

                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchOrders}>Retry</button>
                  </div>
                )}

                {!loading && !error && orders.length === 0 ? (
                  <div className="empty-message">
                    <p>No orders available</p>
                    <p className="small-text">Orders placed by users will appear here.</p>
                  </div>
                ) : (
                  <div className="orders-table-container">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order No.</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
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
                                'Unknown user'
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
                                Details
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                disabled={loading}
                                className="status-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Canceled</option>
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
                <h2>User Management ({users.length})</h2>

                {users.length === 0 ? (
                  <p className="empty-message">No users available</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registration Date</th>
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
                              {user.isAdmin ? 'Admin' : 'User'}
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