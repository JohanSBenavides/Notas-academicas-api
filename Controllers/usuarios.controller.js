// controllers/usuarioController.js
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const Curso = require('../models/Curso');
const bcrypt = require('bcryptjs');

// ======================================================
// Crear un nuevo usuario
// ======================================================
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, idRol, idCurso } = req.body;

    if (!nombre || !correo || !password || !idRol) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios: nombre, correo, contraseña o rol.' });
    }

    // Verificar si el correo ya existe
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({ msg: 'El correo ingresado ya está registrado.' });
    }

    // Encriptar la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password: hash,
      idRol,
      idCurso: idCurso || null,
    });

    // Consultar usuario con relaciones (para retornar datos completos)
    const usuarioConDatos = await Usuario.findByPk(nuevoUsuario.id, {
      include: [
        { model: Rol, as: 'rol', attributes: ['nombre'] },
        { model: Curso, as: 'curso', attributes: ['nombre'] },
      ],
    });

    res.status(201).json({
      msg: 'Usuario creado exitosamente.',
      usuario: usuarioConDatos,
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ msg: 'Error interno al crear usuario.', error: err.message });
  }
};

// ======================================================
// Listar todos los usuarios con sus roles y cursos
// ======================================================
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { model: Rol, as: 'rol', attributes: ['nombre'] },
        { model: Curso, as: 'curso', attributes: ['nombre'] },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      total: usuarios.length,
      usuarios,
    });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ msg: 'Error interno al listar usuarios.', error: err.message });
  }
};

// ======================================================
// Actualizar datos de un usuario por ID
// ======================================================
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, password, idRol, idCurso } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    // Verificar duplicado de correo
    if (correo && correo !== usuario.correo) {
      const existeCorreo = await Usuario.findOne({ where: { correo } });
      if (existeCorreo) {
        return res.status(400).json({ msg: 'El correo ingresado ya está en uso por otro usuario.' });
      }
    }

    // Reencriptar contraseña solo si fue enviada
    const hash = password ? await bcrypt.hash(password, 10) : usuario.password;

    // Actualizar datos
    await usuario.update({
      nombre: nombre ?? usuario.nombre,
      correo: correo ?? usuario.correo,
      password: hash,
      idRol: idRol ?? usuario.idRol,
      idCurso: idCurso ?? usuario.idCurso,
    });

    // Consultar usuario actualizado con relaciones
    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [
        { model: Rol, as: 'rol', attributes: ['nombre'] },
        { model: Curso, as: 'curso', attributes: ['nombre'] },
      ],
    });

    res.json({
      msg: 'Usuario actualizado correctamente.',
      usuario: usuarioActualizado,
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ msg: 'Error interno al actualizar usuario.', error: err.message });
  }
};

// ======================================================
// Eliminar un usuario por ID
// ======================================================
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    await usuario.destroy();

    res.json({
      msg: `Usuario con ID ${id} eliminado correctamente.`,
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ msg: 'Error interno al eliminar usuario.', error: err.message });
  }
};

// ======================================================
// Filtrar usuarios por tipo de rol
// ======================================================
exports.filtrarPorRol = async (req, res) => {
  try {
    const { rol } = req.params;

    const rolEncontrado = await Rol.findOne({ where: { nombre: rol } });
    if (!rolEncontrado) {
      return res.status(404).json({ msg: `No existe un rol con el nombre '${rol}'.` });
    }

    const usuarios = await Usuario.findAll({
      where: { idRol: rolEncontrado.id },
      include: [
        { model: Rol, as: 'rol', attributes: ['nombre'] },
        { model: Curso, as: 'curso', attributes: ['nombre'] },
      ],
      order: [['id', 'ASC']],
    });

    res.json({
      msg: usuarios.length
        ? `Usuarios con rol '${rol}' encontrados.`
        : `No hay usuarios con el rol '${rol}'.`,
      total: usuarios.length,
      usuarios,
    });
  } catch (err) {
    console.error('Error al filtrar usuarios por rol:', err);
    res.status(500).json({ msg: 'Error interno al filtrar por rol.', error: err.message });
  }
};
