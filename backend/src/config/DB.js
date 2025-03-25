module.exports = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: 'root',
    DB: 'watertoys',
    dialect: 'mysql', // ou 'postgres', 'sqlite', 'mssql' selon votre base de données
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  