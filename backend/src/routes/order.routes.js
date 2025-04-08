// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.Controller');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');
const db = require('../models');
const Order = db.order;
const OrderItem = db.orderItem;
const Product = db.product;
const User = db.user;

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Récupérer les commandes de l'utilisateur connecté
router.get('/user', orderController.getUserOrders);

// Route de débogage temporaire - À SUPPRIMER EN PRODUCTION
// ⚠️ IMPORTANT: Cette route doit être avant la route '/:id' ⚠️
// Route de débogage temporaire - À SUPPRIMER EN PRODUCTION
router.get('/debug/all', verifyToken, async (req, res) => {
    try {
      console.log("Route de débogage appelée - récupération de toutes les commandes");
      console.log("Utilisateur:", req.user);
      
      // Récupérer TOUTES les commandes sans filtrer par utilisateur
      const orders = await Order.findAll({
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'firstName', 'lastName', 'email'] 
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{ 
              model: Product, 
              as: 'product',
              attributes: ['id', 'name', 'price', 'imageUrl'] 
            }]
          }
        ],
        order: [['orderDate', 'DESC']]
      });
      
      console.log(`DEBUG: ${orders.length} commandes récupérées`);
      res.status(200).json(orders);
    } catch (error) {
      console.error('Erreur route de débogage:', error);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des commandes", 
        error: error.message 
      });
    }
  });

// Récupérer les détails d'une commande - APRÈS la route de débogage
router.get('/:id', orderController.getOrderById);

// Créer une nouvelle commande
router.post('/', orderController.createOrder);

// Annuler une commande
router.put('/:id/cancel', orderController.cancelOrder);

// Routes admin
router.get('/', isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

// Ajouter cette ligne parmi les routes d'ordre
router.delete('/:id', orderController.deleteOrder);

module.exports = router;