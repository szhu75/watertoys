import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importez le AuthProvider
import Home from './components/JS/Home';
import Contact from './components/JS/Contact';
import Products from './components/JS/Products';
import Locations from './components/JS/Locations';
import LoginSignUp from './components/JS/LoginSignUp';
import AdminDashboard from './components/JS/AdminDashboard';
import UserDashboard from './components/JS/UserDashboard';
import OrderDetail from './components/JS/OrderDetail';
import PaymentPage from './components/JS/PaymentPage';
import ConfirmationPage from './components/JS/ConfirmationPage';
import PrivateRoute from './components/utils/PrivateRoute';

// Composant de redirection basé sur le rôle
const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();
  
  // Vérifier si l'utilisateur est admin
  if (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin === true)) {
    return <Navigate to="/admin-dashboard" />;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Products />} />
            <Route path="/location" element={<Locations />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginSignUp />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/account" element={<RoleBasedRedirect />} />
            <Route path="/admin-dashboard" element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } />
            <Route path="/order/:orderId" element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;