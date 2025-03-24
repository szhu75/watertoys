 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Initialisation de l'application Express
const app = express();

// Middleware CORS pour permettre les requêtes cross-origin
app.use(cors(corsOptions));

// Parsing des requêtes de type application/json
app.use(bodyParser.json());

// Parsing des requêtes de type application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Route simple pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Electric Watertoys.' });
});

// Importation et utilisation des routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/product.routes')(app);
require('./routes/category.routes')(app);
require('./routes/cart.routes')(app);
require('./routes/order.routes')(app);
require('./routes/discount.routes')(app);

// Middleware pour gérer les erreurs
app.use(errorHandler);

// Définition du port
const PORT = process.env.PORT || 8080;

// Synchronisation avec la base de données et démarrage du serveur
db.sequelize.sync({ force: process.env.NODE_ENV === 'development' }).then(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database synchronized in development mode.');
    // Exécution des seeders si en mode développement
    require('./seeders/category.seeder')();
    require('./seeders/product.seeder')();
  }
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}).catch(err => {
  console.error('Failed to synchronize database:', err);
});