// backend/src/scripts/cleanupDuplicateOrders.js
const db = require('../models');
const Order = db.order;
const OrderItem = db.orderItem;
const { sequelize } = db;

/**
 * Génère une signature unique pour une commande basée sur son contenu
 */
const generateOrderSignature = (order) => {
  // Trier les éléments par productId pour assurer une signature cohérente
  const items = order.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice || (item.product && item.product.price)
  })).sort((a, b) => a.productId - b.productId);

  return JSON.stringify({
    userId: order.userId,
    totalAmount: order.totalAmount,
    items: items
  });
};

/**
 * Nettoie les commandes dupliquées en base de données
 */
const cleanupDuplicateOrders = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("Début du nettoyage des commandes dupliquées...");
    
    // Récupérer toutes les commandes avec leurs éléments
    const allOrders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      transaction
    });
    
    console.log(`Total des commandes trouvées: ${allOrders.length}`);
    
    // Créer un Map pour stocker les commandes uniques par signature
    const uniqueOrders = new Map();
    const duplicates = [];
    
    // Identifier les doublons
    allOrders.forEach(order => {
      try {
        const signature = generateOrderSignature(order);
        
        if (uniqueOrders.has(signature)) {
          // C'est un doublon, on le garde pour suppression
          duplicates.push(order.id);
        } else {
          // C'est une commande unique, on la garde
          uniqueOrders.set(signature, order.id);
        }
      } catch (err) {
        console.error(`Erreur lors du traitement de la commande ${order.id}:`, err);
      }
    });
    
    console.log(`Commandes uniques: ${uniqueOrders.size}`);
    console.log(`Doublons identifiés: ${duplicates.length}`);
    
    // Supprimer les doublons si on en a trouvé
    if (duplicates.length > 0) {
      // Supprimer d'abord les éléments de commande (clé étrangère)
      const deletedItems = await OrderItem.destroy({
        where: {
          orderId: duplicates
        },
        transaction
      });
      
      console.log(`Éléments de commande supprimés: ${deletedItems}`);
      
      // Supprimer ensuite les commandes
      const deletedOrders = await Order.destroy({
        where: {
          id: duplicates
        },
        transaction
      });
      
      console.log(`Commandes supprimées: ${deletedOrders}`);
    }
    
    // Valider la transaction
    await transaction.commit();
    
    return {
      totalOrders: allOrders.length,
      uniqueOrders: uniqueOrders.size,
      duplicatesRemoved: duplicates.length
    };
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    console.error('Erreur lors du nettoyage des doublons:', error);
    return { error: error.message };
  }
};

// Exécuter le script
cleanupDuplicateOrders()
  .then(result => {
    console.log("Résultat du nettoyage:", result);
    process.exit(0);
  })
  .catch(err => {
    console.error("Erreur lors de l'exécution du script:", err);
    process.exit(1);
  });