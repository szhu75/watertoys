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
      attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'isAdmin', 'address', 'phone', 'createdAt', 'updatedAt', 'username', 'role']
    });

    if (adminExists) {
      console.log('Un administrateur existe déjà:', adminExists.email);
      
      // S'assurer que le rôle est cohérent avec isAdmin
      if (adminExists.role !== 'admin') {
        console.log('Mise à jour du rôle administrateur pour assurer la cohérence');
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('Rôle administrateur mis à jour avec succès');
      }
      
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
      role: 'admin', // S'assurer que le rôle est explicitement défini
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