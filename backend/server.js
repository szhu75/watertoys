// server.js
const express = require('express');
const cors = require('cors');
const db = require('./src/models');
const corsOptions = require('./src/config/corsOptions');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');
const cartRoutes = require('./src/routes/cart.routes');

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Synchroniser la base de données
db.sequelize.sync({ alter: true }).then(() => {
  console.log('Base de données synchronisée');
}).catch((err) => {
  console.error('Erreur de synchronisation:', err);
});

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Electric Water Toys' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});