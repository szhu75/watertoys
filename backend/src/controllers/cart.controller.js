// src/controllers/cart.controller.js
const db = require('../models');
const Cart = db.cart;
const CartItem = db.cartItem;
const Product = db.product;
const { Op } = require('sequelize');

// Récupérer le panier de l'utilisateur
exports.getCart = async (req, res) => {
  try {
    // Trouver ou créer un panier pour l'utilisateur
    const [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération du panier",
      error: error.message 
    });
  }
};

// Ajouter un élément au panier
exports.addItem = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { productId, quantity } = req.body;
    
    // Valider les données d'entrée
    if (!productId || !quantity || quantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Données d'entrée invalides" });
    }
    
    // Vérifier si le produit existe
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    
    // Vérifier le stock
    if (product.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Stock insuffisant. Seulement ${product.stock} unités disponibles.`
      });
    }
    
    // Trouver ou créer le panier de l'utilisateur
    const [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      transaction
    });
    
    // Vérifier si l'article existe déjà dans le panier
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId
      },
      transaction
    });
    
    if (existingItem) {
      // Vérifier le stock total si on ajoute à un article existant
      const totalQuantity = existingItem.quantity + quantity;
      
      if (product.stock < totalQuantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Stock insuffisant. Seulement ${product.stock} unités disponibles.`
        });
      }
      
      // Mettre à jour la quantité
      existingItem.quantity = totalQuantity;
      await existingItem.save({ transaction });
    } else {
      // Créer un nouvel élément dans le panier
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({ message: "Produit ajouté au panier" });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout au panier:', error);
    res.status(500).json({ 
      message: "Erreur lors de l'ajout au panier",
      error: error.message 
    });
  }
};

// Mettre à jour la quantité d'un élément
exports.updateItem = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    // Valider les données d'entrée
    if (!quantity || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({ message: "Quantité invalide" });
    }
    
    // Trouver d'abord le panier de l'utilisateur
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      transaction
    });
    
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: "Panier non trouvé" });
    }
    
    // Trouver l'élément du panier avec le produit associé
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id
      },
      include: [{ 
        model: Product, 
        as: 'product' 
      }],
      transaction
    });
    
    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ message: "Élément non trouvé dans le panier" });
    }
    
    // Vérifier le stock
    if (cartItem.product.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Stock insuffisant. Seulement ${cartItem.product.stock} unités disponibles.`
      });
    }
    
    // Mettre à jour la quantité
    cartItem.quantity = quantity;
    await cartItem.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({ 
      message: "Quantité mise à jour",
      item: cartItem 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la mise à jour du panier:', error);
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du panier",
      error: error.message 
    });
  }
};

// Supprimer un élément du panier
exports.removeItem = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    
    // Trouver d'abord le panier de l'utilisateur
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      transaction
    });
    
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: "Panier non trouvé" });
    }
    
    // Trouver l'élément du panier
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id
      },
      transaction
    });
    
    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ message: "Élément non trouvé dans le panier" });
    }
    
    // Supprimer l'élément
    await cartItem.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({ message: "Élément supprimé du panier" });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la suppression de l\'élément:', error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression de l'élément",
      error: error.message 
    });
  }
};

// Vider le panier
exports.clearCart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Trouver le panier de l'utilisateur
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      transaction
    });
    
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: "Panier non trouvé" });
    }
    
    // Supprimer tous les éléments du panier
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction
    });
    
    await transaction.commit();
    
    res.status(200).json({ message: "Panier vidé avec succès" });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la suppression du panier:', error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression du panier",
      error: error.message 
    });
  }
};