// src/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/authJwt');

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Récupérer le panier de l'utilisateur
router.get('/', cartController.getCart);

// Ajouter un élément au panier
router.post('/items', cartController.addItem);

// Mettre à jour la quantité d'un élément
router.put('/items/:itemId', cartController.updateItem);

// Supprimer un élément du panier
router.delete('/items/:itemId', cartController.removeItem);

// Vider le panier
router.delete('/', cartController.clearCart);

module.exports = router;