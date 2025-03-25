import React, { useState } from 'react';
import Footer from '../JS/Footer';
import '../CSS/AdminDashboard.css';

const AdminDashboard = () => {

  // États pour gérer les produits
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Jetboard électrique', 
      price: 3500, 
      stock: 5, 
      category: 'Watertoys',
      description: 'Jetboard haute performance pour une expérience nautique unique.'
    },
    { 
      id: 2, 
      name: 'Scooter sous-marin', 
      price: 1200, 
      stock: 10, 
      category: 'Watertoys',
      description: 'Scooter sous-marin compact et puissant.'
    }
  ]);

  // États pour gérer les commandes
  const [orders, setOrders] = useState([
    { 
      id: 1, 
      customer: 'Jean Dupont', 
      total: 3500, 
      status: 'En cours',
      products: ['Jetboard électrique']
    },
    { 
      id: 2, 
      customer: 'Marie Martin', 
      total: 1200, 
      status: 'Livré',
      products: ['Scooter sous-marin']
    }
  ]);

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

  // Gestion des changements dans le formulaire de nouveau produit
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ajouter un nouveau produit
  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const productToAdd = {
      ...newProduct,
      id: products.length + 1,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    };

    // Mode édition ou ajout
    if (editingProduct) {
      // Mettre à jour un produit existant
      setProducts(products.map(p => 
        p.id === editingProduct.id ? productToAdd : p
      ));
      setEditingProduct(null);
    } else {
      // Ajouter un nouveau produit
      setProducts([...products, productToAdd]);
    }

    // Réinitialiser le formulaire
    setNewProduct({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: ''
    });
  };

  // Supprimer un produit
  const handleDeleteProduct = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  // Début de l'édition d'un produit
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description
    });
  };

  // Mettre à jour le statut de la commande
  const handleUpdateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Tableau de Bord Administrateur</h1>
        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
        >
          Déconnexion
        </button>
      </header>

      <div className="dashboard-content">
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
            
            <button type="submit" className="submit-btn">
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
          </form>

          <div className="product-list">
            <h3>Liste des Produits</h3>
            <table>
              <thead>
                <tr>
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
                    <td>{product.name}</td>
                    <td>{product.price}€</td>
                    <td>{product.stock}</td>
                    <td>{product.category}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditProduct(product)}
                      >
                        Éditer
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="orders-management">
          <h2>Gestion des Commandes</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
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
                  <td>{order.customer}</td>
                  <td>{order.products.join(', ')}</td>
                  <td>{order.total}€</td>
                  <td>{order.status}</td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="En cours">En cours</option>
                      <option value="Traitement">Traitement</option>
                      <option value="Expédié">Expédié</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;