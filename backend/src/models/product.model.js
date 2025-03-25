module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("products", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { 
          msg: "Le nom du produit est requis" 
        },
        len: {
          args: [2, 255],
          msg: "Le nom doit avoir entre 2 et 255 caractères"
        }
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "La description ne peut pas dépasser 1000 caractères"
        }
      }
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { 
          args: [0],
          msg: "Le prix doit être positif"
        },
        isFloat: {
          msg: "Le prix doit être un nombre décimal"
        }
      }
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { 
          args: [0],
          msg: "Le stock ne peut pas être négatif"
        },
        isInt: {
          msg: "Le stock doit être un nombre entier"
        }
      }
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isUrl: { 
          args: true,
          msg: "L'URL de l'image n'est pas valide" 
        }
      }
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    hooks: {
      // Nettoyer et normaliser les données avant validation
      beforeValidate: (product) => {
        // Convertir le prix et le stock en nombres
        if (product.price) product.price = parseFloat(product.price);
        if (product.stock) product.stock = parseInt(product.stock);
        
        // Trim des champs de texte
        if (product.name) product.name = product.name.trim();
        if (product.description) product.description = product.description.trim();
      }
    }
  });

  return Product;
};