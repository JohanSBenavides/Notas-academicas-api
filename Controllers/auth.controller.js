const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
const { correo, password } = req.body;
try {
const usuario = await Usuario.findOne({ where: { correo } });
if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });


const match = await bcrypt.compare(password, usuario.password);
if (!match) return res.status(401).json({ msg: 'Credenciales inválidas' });


const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
res.json({ token });
} catch (err) {
res.status(500).json({ err: err.message });
}
};