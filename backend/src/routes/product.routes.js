const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.Controller');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');

// Routes publiques pour récupérer les produits (accessibles sans authentification)
router.get('/', productController.getAllProducts);
router.get('/categories/all', productController.getAllCategories);
router.get('/:id', productController.getProductById);

// Middleware d'authentification pour les routes protégées
router.use(verifyToken);
router.use(isAdmin);

// Routes protégées (nécessitant une authentification admin)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);

// Nouvelles routes pour la gestion de la corbeille
router.get('/trash/all', productController.getTrashedProducts);
router.put('/:id/trash', productController.trashProduct);
router.put('/:id/restore', productController.restoreProduct);
router.delete('/trash/empty', productController.emptyTrash);

// Route pour la suppression définitive (renommée de deleteProduct)
router.delete('/:id', productController.deleteProduct);

module.exports = router;