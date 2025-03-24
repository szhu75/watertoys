import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import { reportWebVitals } from './reportWebVitals';  // Suppression de l'importation

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si vous souhaitez mesurer les performances de votre application, 
// commentez ou supprimez cet appel
// reportWebVitals();
