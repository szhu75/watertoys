const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.user;

// Vérification du token JWT
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  // Si le token commence par Bearer, supprimer le préfixe
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Vérification si l'utilisateur est administrateur
isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user.isAdmin) {
      next();
      return;
    }
    
    res.status(403).send({
      message: "Require Admin Role!"
    });
    return;
  });
};

// Vérification si l'utilisateur est le propriétaire ou un administrateur
isOwnerOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const resourceId = parseInt(req.params.id);
    
    // Si l'utilisateur est admin ou est le propriétaire de la ressource
    if (user.isAdmin || req.userId === resourceId) {
      next();
      return;
    }
    
    res.status(403).send({
      message: "Unauthorized access to this resource!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Error checking user permissions"
    });
  }
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isOwnerOrAdmin: isOwnerOrAdmin
};

module.exports = authJwt;