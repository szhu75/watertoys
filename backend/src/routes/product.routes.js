const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.Controller');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');

// Middleware global pour toutes les routes de produits
router.use(verifyToken);
router.use(isAdmin);

// Routes pour les produits
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Route pour récupérer les catégories
router.get('/categories/all', productController.getAllCategories);

module.exports = router;