module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("orders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
      },
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      trackingNumber: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  
    return Order;
  };