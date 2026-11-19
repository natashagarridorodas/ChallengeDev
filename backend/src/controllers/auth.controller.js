const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario en la base de datos
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión.' });
  }
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Usuario creado con éxito', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};