import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/LoginSignUp.css';
import { useAuth } from '../../context/AuthContext';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Utiliser le contexte d'authentification
  const { login, register, isAuthenticated } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation côté client
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      
      if (isLogin) {
        // Connexion
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Inscription
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      }

      if (result.success) {
        // La redirection sera gérée par le useEffect qui surveille isAuthenticated
        localStorage.setItem('justLoggedIn', 'true');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="login-signup-container">
      <div className="form-container">
        <div className="logo-container">
          <img 
            src="/images/logo-lift.jpeg" 
            alt="Electric Water Toys Logo" 
            className="logo" 
          />
          <h1>Electric Water Toys</h1>
        </div>
        
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
        
        {/* Afficher un message si l'utilisateur vient de la page produits */}
        {localStorage.getItem('pendingProductId') && (
          <div className="info-message">
            <p>Connectez-vous pour ajouter le produit à votre panier</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom d'utilisateur"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Votre adresse email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Mot de passe (8 caractères min.)"
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="8"
                placeholder="Confirmez votre mot de passe"
              />
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {isLogin ? 'Se connecter' : 'S\'inscrire'}
            {loading && ' ...'}
          </button>
          
          <div className="toggle-form">
            <p>
              {isLogin 
                ? "Vous n'avez pas de compte ? " 
                : "Vous avez déjà un compte ? "}
              <span onClick={toggleForm}>
                {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;