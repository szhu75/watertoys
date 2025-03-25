const db = require('../models');
const Category = db.category;
const Product = db.product;

async function initializeProductsAndCategories() {
  try {
    // Créer la catégorie Watertoys si elle n'existe pas
    const [category, created] = await Category.findOrCreate({
      where: { name: 'Watertoys' },
      defaults: {
        name: 'Watertoys',
        description: 'Jouets aquatiques électriques'
      }
    });

    // Produits à ajouter
    const produitsInitiaux = [
      {
        name: 'GOCYCLE',
        description: 'Compact and foldable electric bike, perfect for urban use and beach areas. Innovative design with high performance.',
        price: 2999.99,
        stock: 8,
        imageUrl: '/images/gocycle.jpg',
        categoryId: category.id
      },
      {
        name: 'POOLSTAR',
        description: 'Electric board for pools and calm seas, ideal for beginners. Intuitive navigation with long-lasting battery.',
        price: 1499.99,
        stock: 12,
        imageUrl: '/images/poolstar.jpg',
        categoryId: category.id
      },
      {
        name: 'ZAPATA',
        description: 'High-performance flyboard for thrilling experiences. Rises up to 15 meters above water for an incomparable aerial adventure.',
        price: 3999.99,
        stock: 5,
        imageUrl: '/images/zapata.jpg',
        categoryId: category.id
      },
      {
        name: 'SUBLUE',
        description: 'Compact and powerful underwater scooter. Perfect for exploring marine depths, reaching down to 30 meters.',
        price: 1199.99,
        stock: 10,
        imageUrl: '/images/sublue.jpg',
        categoryId: category.id
      },
      {
        name: 'TIWAL',
        description: 'Portable inflatable sailboat that\'s easy to assemble. Offers performance and stability for all sailing levels.',
        price: 2499.99,
        stock: 7,
        imageUrl: '/images/tiwal.jpg',
        categoryId: category.id
      }
    ];

    // Vérifier si les produits existent déjà
    const produitsExistants = await Product.findAll({
      where: { categoryId: category.id }
    });

    if (produitsExistants.length === 0) {
      // Ajouter les produits
      await Product.bulkCreate(produitsInitiaux);
      console.log('Produits initiaux ajoutés avec succès');
    } else {
      console.log('Les produits initiaux existent déjà');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des produits:', error);
  }
}

// Exécuter l'initialisation
initializeProductsAndCategories();