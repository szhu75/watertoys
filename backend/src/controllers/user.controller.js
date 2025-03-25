const db = require('../models');
const User = db.user;

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
  }
};

// Mettre à jour un utilisateur par ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
  }
};

// Supprimer un utilisateur par ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    await user.destroy();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
  }
};
