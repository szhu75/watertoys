const config = require('../config/db.config.js');
const Sequelize = require('sequelize');

// Création de l'instance Sequelize
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: 0,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importation des modèles
db.user = require('./user.model.js')(sequelize, Sequelize);
db.product = require('./product.model.js')(sequelize, Sequelize);
db.category = require('./category.model.js')(sequelize, Sequelize);
db.cart = require('./cart.model.js')(sequelize, Sequelize);
db.cartItem = require('./cartItem.model.js')(sequelize, Sequelize);
db.order = require('./order.model.js')(sequelize, Sequelize);
db.orderItem = require('./orderItem.model.js')(sequelize, Sequelize);
db.discount = require('./discount.model.js')(sequelize, Sequelize);

// Relations entre les modèles
// Relation 1:N entre User et Cart (un utilisateur a un panier)
db.user.hasOne(db.cart, {
  foreignKey: 'userId',
  as: 'cart'
});
db.cart.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'user'
});

// Relation 1:N entre Cart et CartItem (un panier contient plusieurs articles)
db.cart.hasMany(db.cartItem, {
  foreignKey: 'cartId',
  as: 'items'
});
db.cartItem.belongsTo(db.cart, {
  foreignKey: 'cartId',
  as: 'cart'
});

// Relation 1:N entre Product et CartItem
db.product.hasMany(db.cartItem, {
  foreignKey: 'productId',
  as: 'cartItems'
});
db.cartItem.belongsTo(db.product, {
  foreignKey: 'productId',
  as: 'product'
});

// Relation 1:N entre Category et Product
db.category.hasMany(db.product, {
  foreignKey: 'categoryId',
  as: 'products'
});
db.product.belongsTo(db.category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Relation 1:N entre User et Order
db.user.hasMany(db.order, {
  foreignKey: 'userId',
  as: 'orders'
});
db.order.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'user'
});

// Relation 1:N entre Order et OrderItem
db.order.hasMany(db.orderItem, {
  foreignKey: 'orderId',
  as: 'items'
});
db.orderItem.belongsTo(db.order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Relation 1:N entre Product et OrderItem
db.product.hasMany(db.orderItem, {
  foreignKey: 'productId',
  as: 'orderItems'
});
db.orderItem.belongsTo(db.product, {
  foreignKey: 'productId',
  as: 'product'
});

// Relation N:M entre Product et Discount (un produit peut avoir plusieurs remises et vice versa)
db.product.belongsToMany(db.discount, {
  through: 'ProductDiscount',
  foreignKey: 'productId',
  otherKey: 'discountId',
  as: 'discounts'
});
db.discount.belongsToMany(db.product, {
  through: 'ProductDiscount',
  foreignKey: 'discountId',
  otherKey: 'productId',
  as: 'products'
});

module.exports = db;