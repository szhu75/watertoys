// src/middlewares/verifySignUp.js
const db = require('../models');
const User = db.user;

// Vérifier si l'email ou le nom d'utilisateur existe déjà
checkDuplicateEmail = async (req, res, next) => {
  try {
    // Vérifier l'email
    const userEmail = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (userEmail) {
      return res.status(400).send({
        message: "Erreur! Cet email est déjà utilisé!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Impossible de vérifier l'email",
      error: error.message
    });
  }
};

checkDuplicateUsername = async (req, res, next) => {
  try {
    // Vérifier le nom d'utilisateur
    const username = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (username) {
      return res.status(400).send({
        message: "Erreur! Ce nom d'utilisateur est déjà utilisé!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Impossible de vérifier le nom d'utilisateur",
      error: error.message
    });
  }
};

// Valider le mot de passe (au moins 8 caractères)
validatePassword = (req, res, next) => {
  if (!req.body.password || req.body.password.length < 8) {
    return res.status(400).send({
      message: "Le mot de passe doit contenir au moins 8 caractères!"
    });
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateEmail,
  checkDuplicateUsername,
  validatePassword
};

module.exports = verifySignUp;