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
      return res.status(401).send({
        message: "Non autorisé! Token invalide ou expiré."
      });
    }
    
    // Stocker les informations décodées dans req.user
    req.user = decoded;
    next();
  });
};

isAdmin = (req, res, next) => {
  // Vérifier si l'utilisateur est un admin selon les informations du token
  if (req.user && (req.user.isAdmin === true || req.user.role === "admin")) {
    next();
    return;
  }

  res.status(403).send({
    message: "Accès réservé aux administrateurs!"
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;