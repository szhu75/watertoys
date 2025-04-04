const db = require('../models');
const Product = db.product;
const Category = db.category;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Assurez-vous que ce chemin correspond à votre structure de projet
    const uploadDir = path.join(__dirname, '../../frontend/public/images/products');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nom de fichier unique avec timestamp
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des produits",
      error: error.message 
    });
  }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name, description, price, stock, categoryId } = req.body;
      
      // Validation de base
      if (!name || !price || !stock || !categoryId) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      // Construire l'objet produit
      const productData = {
        name, 
        description, 
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId)
      };

      // Ajouter le chemin de l'image si un fichier a été uploadé
      if (req.file) {
        productData.imageUrl = `/images/products/${req.file.filename}`;
      }

      try {
        const product = await Product.create(productData);
        res.status(201).json(product);
      } catch (validationError) {
        // Gérer les erreurs de validation Sequelize
        res.status(400).json({
          message: "Erreur de validation",
          errors: validationError.errors 
            ? validationError.errors.map(e => e.message)
            : validationError
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({ 
      message: "Erreur lors de la création du produit", 
      error: error.message 
    });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { id } = req.params;
      const { name, description, price, stock, categoryId } = req.body;
      
      // Trouver le produit existant
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Construire l'objet de mise à jour
      const updateData = {
        name, 
        description, 
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId)
      };

      // Gérer le téléchargement d'image
      if (req.file) {
        // Supprimer l'ancienne image si elle existe
        if (product.imageUrl) {
          const oldImagePath = path.join(__dirname, '../../frontend/public', product.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
              console.warn('Impossible de supprimer l\'ancienne image:', unlinkError);
            }
          }
        }
        updateData.imageUrl = `/images/products/${req.file.filename}`;
      }

      try {
        // Mettre à jour le produit
        await product.update(updateData);
        
        // Récupérer le produit mis à jour avec la catégorie
        const updatedProduct = await Product.findByPk(id, {
          include: [{ 
            model: Category, 
            as: 'category',
            attributes: ['id', 'name']
          }]
        });
        
        res.status(200).json(updatedProduct);
      } catch (validationError) {
        res.status(400).json({
          message: "Erreur de validation",
          errors: validationError.errors 
            ? validationError.errors.map(e => e.message)
            : validationError
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du produit", 
      error: error.message 
    });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Supprimer l'image associée si elle existe
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '../../frontend/public', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkError) {
          console.warn('Impossible de supprimer l\'image:', unlinkError);
        }
      }
    }

    await product.destroy();
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression du produit", 
      error: error.message 
    });
  }
};

// Récupérer les détails d'un produit
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération du produit", 
      error: error.message 
    });
  }
};

// Récupérer les catégories pour le formulaire de produit
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des catégories", 
      error: error.message 
    });
  }
};