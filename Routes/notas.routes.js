const express = require('express');
const router = express.Router();
const notaController = require('../Controllers/notas.controller');

router.post('/', notaController.crearNota);
router.put('/:id', notaController.actualizarNota);
router.delete('/:id', notaController.eliminarNota);
router.get('/', notaController.listarNotas);
router.get('/estudiante/:idEstudiante', notaController.filtrarPorEstudiante);
router.get('/materia/:idMateria', notaController.filtrarPorMateria);
router.get('/materia/:idMateria/rango', notaController.filtrarPorMateriaYRango);

module.exports = router;
