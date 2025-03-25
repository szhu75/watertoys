import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../JS/Footer';
import '../CSS/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile'); // 'products', 'profile', ou 'users'
  
  // États pour gérer les données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour le formulaire d'ajout de produit
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  });

  // États pour le mode édition
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Récupérer les informations de l'utilisateur
  const [user, setUser] = useState({});

  // Fonction pour récupérer le token JWT
  const getToken = () => localStorage.getItem('token');

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log('Produits récupérés:', response.data);
      setProducts(Array.isArray(response.data) ? response.data : (response.data.products || []));
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      setError('Impossible de récupérer les produits. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les commandes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log('Commandes récupérées:', response.data);
      setOrders(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      setError('Impossible de récupérer les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log('Utilisateurs récupérés:', response.data);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Impossible de récupérer les utilisateurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter un produit
  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/products', productData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
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
  }, [fetchProducts]);

  // Fonction pour mettre à jour un produit
  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/products/${productId}`, productData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
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
  }, [fetchProducts]);

  // Fonction pour supprimer un produit
  const deleteProduct = useCallback(async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return { success: false };
    }
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log('Produit supprimé:', productId);
      fetchProducts(); // Rafraîchir la liste des produits
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      setError('Impossible de supprimer le produit. Veuillez réessayer.');
      return { success: false, error: err.response?.data?.message || 'Erreur lors de la suppression du produit' };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Fonction pour mettre à jour le statut d'une commande
  const updateOrderStatus = useCallback(async (orderId, status) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status },
        { headers: { 
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
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
  }, [fetchOrders]);

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
    fetchOrders();
    fetchUsers();
  }, [navigate, fetchProducts, fetchOrders, fetchUsers]);

  // Gestion des changements dans le formulaire de nouveau produit
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ajouter ou mettre à jour un produit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    

    
    // Validation de base
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
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
        category: '',
        description: ''
      });
      setEditingProduct(null);
    } else {
      alert(result.error || 'Une erreur est survenue');
    }
  };

  // Début de l'édition d'un produit
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      description: product.description || ''
    });
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
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
  };

  return (
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
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Déconnexion
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

          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>Mon Profil Administrateur</h2>
              <div className="profile-info">
                <p><strong>Nom:</strong> {user.lastName}</p>
                <p><strong>Prénom:</strong> {user.firstName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> Administrateur</p>
                <button 
                  className="edit-profile-btn"
                  onClick={() => navigate('/edit-profile')}
                >
                  Modifier mon profil
                </button>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <section className="products-management">
              <h2>Gestion des Produits</h2>
              
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
                    name="category"
                    value={newProduct.category}
                    onChange={handleNewProductChange}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Watertoys">Water Toys</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                </div>
                
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  placeholder="Description du produit"
                  required
                />
                
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
                          category: '',
                          description: ''
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
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Catégorie</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.price}€</td>
                          <td>{product.stock}</td>
                          <td>{product.category}</td>
                          <td>
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditProduct(product)}
                              disabled={loading}
                            >
                              Éditer
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={loading}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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
                      <th>ID</th>
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
                        <td>{order.id}</td>
                        <td>
                          {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Utilisateur inconnu'}
                          <br />
                          <small>{order.user?.email}</small>
                        </td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>
                          {order.items ? (
                            <ul className="order-items-list">
                              {order.items.map((item, index) => (
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
  );
};

export default AdminDashboard;