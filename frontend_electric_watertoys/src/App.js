import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Importez le AuthProvider
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