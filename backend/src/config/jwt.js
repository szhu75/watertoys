// src/config/jwt.js
module.exports = {
  secret: "X9f$mK2#pQ7zL4@jN6&wR3!bT5^hS8*",   // Changez cette clé en production!
  jwtExpiration: "24h",                      // Token valide pendant 24 heures
  jwtRefreshExpiration: "7d"                 // Token de rafraîchissement valide pendant 7 jours
};