// src/middlewares/authJwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const db = require('../models');
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "Aucun token fourni!"
    });
  }

  // Supprimer le préfixe "Bearer " si présent
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.error("Erreur de vérification du token:", err);
      return res.status(401).send({
        message: "Non autorisé! Token invalide ou expiré."
      });
    }
    
    // Stocker les informations décodées dans req.user
    req.user = decoded;
    console.log("Token décodé:", decoded);
    next();
  });
};

isAdmin = (req, res, next) => {
  console.log("Vérification des droits d'administrateur:");
  console.log("Utilisateur:", req.user);
  
  // Vérifier si req.user existe
  if (!req.user) {
    console.error("Erreur: req.user est undefined - Le middleware verifyToken doit être exécuté d'abord");
    return res.status(403).send({
      message: "Accès non autorisé. Utilisateur non authentifié."
    });
  }
  
  // Plusieurs façons de vérifier les droits d'administrateur
  const isAdminFlag = req.user.isAdmin === true;
  const isAdminRole = req.user.role === 'admin';
  
  console.log(`isAdmin flag: ${isAdminFlag}, role admin: ${isAdminRole}`);
  
  if (isAdminFlag || isAdminRole) {
    console.log("Accès admin accordé");
    next();
    return;
  }
  
  console.error("Accès admin refusé");
  res.status(403).send({
    message: "Accès réservé aux administrateurs!"
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;