// tests/authJwt.test.js
const jwt = require('jsonwebtoken');
const authJwt = require('../src/middlewares/authJwt');
const config = require('../src/config/jwt');
const assert = require('assert');

describe('Auth JWT Middleware', () => {
  it('devrait rejeter une requête sans token', () => {
    // Mock des objets req, res, next
    const req = { headers: {} };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      send: function(data) {
        this.data = data;
        return this;
      }
    };
    const next = () => {
      this.nextCalled = true;
    };

    // Appel de la fonction à tester
    authJwt.verifyToken(req, res, next);

    // Vérification du comportement attendu
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.data, { message: "Aucun token fourni!" });
  });

  it('devrait accepter une requête avec un token valide', () => {
    // Créer un token valide
    const userData = { id: 1, email: 'test@example.com', role: 'user' };
    const token = jwt.sign(userData, config.secret, { expiresIn: '1h' });

    // Mock des objets req, res, next
    const req = { 
      headers: { 
        "authorization": `Bearer ${token}` 
      } 
    };
    
    let nextCalled = false;
    const res = {};
    const next = () => {
      nextCalled = true;
    };

    // Appel de la fonction à tester
    authJwt.verifyToken(req, res, next);

    // Vérification que next() a été appelé et que req.user contient les données correctes
    assert.ok(nextCalled);
    assert.equal(req.user.email, userData.email);
    assert.equal(req.user.role, userData.role);
  });
});