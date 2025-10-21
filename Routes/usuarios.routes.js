const express = require('express');
const router = express.Router();
const usuariosController = require('../Controllers/usuarios.controller');
const verificarToken = require('../middlewares/verificarToken');


router.post('/', verificarToken, usuariosController.crearUsuario);
router.get('/', verificarToken, usuariosController.listarUsuarios);
router.get('/rol/:rol', usuariosController.filtrarPorRol);
router.put('/:id', usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;