const db = require('../models');
const User = db.user;

// Validate username
const checkDuplicateUsername = async (req, res, next) => {
  try {
    // Check if username already exists
    const existingUser = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Failed! Username is already in use!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate username"
    });
  }
};

// Validate email
const checkDuplicateEmail = async (req, res, next) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Failed! Email is already in use!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate email"
    });
  }
};

// Validate password strength
const validatePassword = (req, res, next) => {
  const password = req.body.password;

  // Password validation rules
  // At least 8 characters long
  // Contains at least one uppercase letter
  // Contains at least one lowercase letter
  // Contains at least one number
  // Contains at least one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).send({
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    });
  }

  next();
};

// Validate signup input
const verifySignUp = {
  checkDuplicateUsername,
  checkDuplicateEmail,
  validatePassword
};

module.exports = verifySignUp;