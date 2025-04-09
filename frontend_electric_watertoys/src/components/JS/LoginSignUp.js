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
        setError('Passwords do not match');
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
        // Redirection conditionnelle basée sur le rôle de l'utilisateur
        localStorage.setItem('justLoggedIn', 'true');
        
        // Récupérer les informations de l'utilisateur connecté
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Rediriger vers le tableau de bord approprié
        if (user && (user.role === 'admin' || user.isAdmin === true)) {
          console.log("Redirecting to admin dashboard");
          navigate('/admin-dashboard');
        } else {
          console.log("Redirecting to user dashboard");
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during login');
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
        
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        {/* Afficher un message si l'utilisateur vient de la page produits */}
        {localStorage.getItem('pendingProductId') && (
          <div className="info-message">
            <p>Log in to add the product to your cart</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Your username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Your first name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Your last name"
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
              placeholder="Your email address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Password (min. 8 characters)"
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="8"
                placeholder="Confirm your password"
              />
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {isLogin ? 'Log In' : 'Sign Up'}
            {loading && ' ...'}
          </button>
          
          <div className="toggle-form">
            <p>
              {isLogin 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <span onClick={toggleForm}>
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
