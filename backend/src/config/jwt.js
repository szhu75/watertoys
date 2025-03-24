 
module.exports = {
    secret: process.env.JWT_SECRET || "X9f$mK2#pQ7zL4@jN6&wR3!bT5^hS8*",
    jwtExpiration: 86400,           // 24 heures en secondes
    jwtRefreshExpiration: 604800,   // 7 jours en secondes
  };