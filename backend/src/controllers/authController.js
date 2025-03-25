const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

exports.signup = async (req, res) => {
  try {
    // Créer un nouvel utilisateur
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8), // Hachage du mot de passe
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      role: "user", // Par défaut, un nouveau utilisateur n'est pas admin
      isAdmin: false
    });

    // Créer un panier pour l'utilisateur si votre modèle le prévoit
    if (db.cart) {
      await db.cart.create({
        userId: user.id
      });
    }

    res.status(201).send({ 
      message: "Utilisateur enregistré avec succès!", 
      userId: user.id 
    });
  } catch (error) {
    res.status(500).send({ 
      message: "Erreur lors de l'enregistrement de l'utilisateur",
      error: error.message 
    });
  }
};

exports.signin = async (req, res) => {
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Mot de passe invalide!"
      });
    }

    // S'assurer que le rôle est cohérent avec isAdmin
    const role = user.isAdmin ? "admin" : "user";
    
    // Si l'utilisateur est admin mais que le rôle n'est pas correctement défini, mettre à jour
    if (user.isAdmin && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Générer un token JWT avec plus d'informations sur l'utilisateur
    const token = jwt.sign({ 
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: role,
      firstName: user.firstName,
      lastName: user.lastName
    }, config.secret, {
      expiresIn: config.jwtExpiration // durée configurée dans config/jwt.js
    });

    // Log pour déboguer
    console.log("Utilisateur connecté:", {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: role
    });

    res.status(200).send({
      id: user.id,
      username: user.username || user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
      isAdmin: user.isAdmin,
      accessToken: token
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).send({ 
      message: "Erreur lors de la connexion",
      error: error.message 
    });
  }
};