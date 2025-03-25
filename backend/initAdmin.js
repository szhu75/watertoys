const bcrypt = require('bcryptjs');
const db = require('./src/models');
const User = db.user;

async function initAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({
      where: {
        isAdmin: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'isAdmin', 'address', 'phone', 'createdAt', 'updatedAt', 'username']
    });

    if (adminExists) {
      console.log('Un administrateur existe déjà');
      return;
    }

    // Créer l'administrateur
    await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@electricwatertoys.com',
      username: 'admin', // Ajout du champ username qui est maintenant obligatoire
      password: bcrypt.hashSync('Admin@123', 10),
      isAdmin: true,
      address: 'Electric Water Toys HQ',
      phone: '0927514892'
    });

    console.log('Administrateur créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    process.exit();
  }
}

// Exécuter la fonction
initAdmin();