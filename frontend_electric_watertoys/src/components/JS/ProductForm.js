import React, { useState, useEffect } from 'react';
import UploadImage from './UploadImage';

const ProductForm = ({ 
  product, 
  onSubmit, 
  categories: initialCategories = [] 
}) => {
  // États pour les catégories et le formulaire
  const [categories, setCategories] = useState(initialCategories);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    image: null,
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les catégories si non fournies
  useEffect(() => {
    const fetchCategories = async () => {
      if (initialCategories.length === 0) {
        try {
          const response = await fetch('http://localhost:5000/api/products/categories/all');
          if (!response.ok) {
            throw new Error('Impossible de charger les catégories');
          }
          const data = await response.json();
          setCategories(data);
        } catch (err) {
          console.error('Erreur de chargement des catégories', err);
          setError('Impossible de charger les catégories');
        }
      }
    };

    fetchCategories();
  }, [initialCategories]);

  // Pré-remplir le formulaire si un produit est passé
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price !== undefined ? product.price.toString() : '',
        stock: product.stock !== undefined ? product.stock.toString() : '',
        categoryId: product.categoryId || (product.category ? product.category.id : ''),
        image: null,
        imageUrl: product.imageUrl || ''
      });
    }
  }, [product]);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion du téléchargement d'image
  const handleImageUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      image: file,
      imageUrl: '' // Réinitialiser l'URL de l'image existante
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation de base
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    // Créer un FormData pour pouvoir envoyer le fichier image
    const submitData = new FormData();
    
    // Ajouter tous les champs texte
    Object.keys(formData).forEach(key => {
      if (key !== 'image' && key !== 'imageUrl' && formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    // Ajouter l'image si présente
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        method: product ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      };

      const url = product 
        ? `http://localhost:5000/api/products/${product.id}` 
        : 'http://localhost:5000/api/products';

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 
          (errorData.errors && Array.isArray(errorData.errors) 
            ? errorData.errors.join(', ') 
            : 'Une erreur est survenue')
        );
      }

      const data = await response.json();
      
      // Appeler la fonction de callback avec la réponse
      onSubmit(data);

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        image: null,
        imageUrl: ''
      });

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du produit:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-bold">Nom du Produit</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nom du produit"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold">Catégorie</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Description du produit"
          rows="4"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-bold">Prix (€)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Prix du produit"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Quantité en stock"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">Image du Produit</label>
        <UploadImage 
          onImageUpload={handleImageUpload}
          currentImage={formData.imageUrl}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Enregistrement...' : (product ? 'Mettre à jour' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;