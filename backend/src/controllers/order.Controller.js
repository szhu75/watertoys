// src/controllers/order.controller.js
const db = require('../models');
const Order = db.order;
const OrderItem = db.orderItem;
const Cart = db.cart;
const CartItem = db.cartItem;
const Product = db.product;
const User = db.user;
const { sequelize } = db;

// Créer une nouvelle commande à partir du panier
// Dans la fonction createOrder de votre order.Controller.js

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Récupérer l'utilisateur
    const user = await User.findByPk(req.user.id);
    
    // Utilisez une adresse par défaut si l'utilisateur n'en a pas
    // Et si elle est fournie dans la requête, utilisez-la
    const shippingAddress = user.address || req.body.shippingAddress || "Adresse non spécifiée";
    
    // Récupérer le panier avec ses produits
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Votre panier est vide" });
    }
    
    // Calculer le montant total
    let totalAmount = 0;
    
    for (const item of cart.items) {
      const product = item.product;
      
      // Vérifier le stock
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
        });
      }
      
      // Ajouter au total
      totalAmount += product.price * item.quantity;
      
      // Mettre à jour le stock
      product.stock -= item.quantity;
      await product.save({ transaction });
    }
    
    // Créer la commande avec l'adresse de livraison par défaut ou fournie
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      status: 'pending',
      orderDate: new Date(),
      shippingAddress: shippingAddress,
      paymentMethod: req.body.paymentMethod || 'card'
    }, { transaction });
    
    // Créer les éléments de commande
    const orderItems = [];
    for (const item of cart.items) {
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.product.price * item.quantity
      }, { transaction });
      
      orderItems.push(orderItem);
    }
    
    // Vider le panier
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction
    });
    
    await transaction.commit();
    
    res.status(201).json({
      message: "Commande créée avec succès",
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.orderDate
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
  }
};

// Récupérer toutes les commandes de l'utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['orderDate', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
};

// Récupérer les détails d'une commande
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    let whereClause = { id: orderId };
    
    // Si l'utilisateur n'est pas admin, restreindre aux commandes de l'utilisateur
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }
    
    const order = await Order.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
};

// Annuler une commande (si elle est en attente)
exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderId = req.params.id;
    
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id,
        status: 'pending'
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: "Commande non trouvée ou ne peut plus être annulée" 
      });
    }
    
    // Restaurer le stock
    for (const item of order.items) {
      const product = item.product;
      product.stock += item.quantity;
      await product.save({ transaction });
    }
    
    // Mettre à jour le statut
    order.status = 'cancelled';
    await order.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({ message: "Commande annulée avec succès" });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'annulation de la commande" });
  }
};

// Pour l'admin: Récupérer toutes les commandes
// Pour l'admin: Récupérer toutes les commandes
exports.getAllOrders = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      console.error("Tentative d'accès sans droits admin:", req.user);
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    console.log("Récupération de toutes les commandes par l'admin:", req.user.id);
    
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
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['orderDate', 'DESC']]
    });
    
    console.log(`Nombre de commandes récupérées: ${orders.length}`);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des commandes",
      error: error.message 
    });
  }
};

// Pour l'admin: Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    // Mettre à jour le statut et éventuellement le numéro de suivi
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    await order.save();
    
    res.status(200).json({ message: "Statut de la commande mis à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

// Pour l'utilisateur: Supprimer une commande (si elle est en attente)
exports.deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderId = req.params.id;
    
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id,
        // Seulement les commandes en attente peuvent être supprimées
        status: 'pending'
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: "Commande non trouvée ou ne peut plus être supprimée" 
      });
    }
    
    // Restaurer le stock
    for (const item of order.items) {
      const product = item.product;
      product.stock += item.quantity;
      await product.save({ transaction });
    }
    
    // Supprimer d'abord les éléments de commande
    await OrderItem.destroy({
      where: { orderId: order.id },
      transaction
    });
    
    // Supprimer la commande
    await Order.destroy({
      where: { id: order.id },
      transaction
    });
    
    await transaction.commit();
    
    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
};