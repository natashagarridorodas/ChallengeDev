const express = require('express');
const cors = require('cors');
const sequelize = require('./providers/db');
require('./models/player.model');
require('./models/user.model');

const authRoutes = require('./routes/auth.routes');
const playerRoutes = require('./routes/player.routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('¡Base de datos sincronizada correctamente!');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });