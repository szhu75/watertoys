// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.Controller');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Récupérer les commandes de l'utilisateur connecté
router.get('/user', orderController.getUserOrders);

// Récupérer les détails d'une commande
router.get('/:id', orderController.getOrderById);

// Créer une nouvelle commande
router.post('/', orderController.createOrder);

// Annuler une commande
router.put('/:id/cancel', orderController.cancelOrder);

// Routes admin
router.get('/', isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;