const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // Puedes ponerlo en true si quieres ver las consultas SQL por consola
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('¡Conexión a la base de datos MySQL establecida con éxito mediante Sequelize!');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

testConnection();

module.exports = sequelize;