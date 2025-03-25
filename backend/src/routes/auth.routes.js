const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');
const verifySignUp = require('../middlewares/verifySignUp');

// Route d'inscription
router.post('/signup', [
  verifySignUp.checkDuplicateUsername,
  verifySignUp.checkDuplicateEmail,
  verifySignUp.validatePassword
], signup);

// Route de connexion
router.post('/signin', signin);

module.exports = router;