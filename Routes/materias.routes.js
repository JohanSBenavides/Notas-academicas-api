const express = require('express');
const router = express.Router();
const materiaController = require('../Controllers/materias.controller');

router.post('/', materiaController.crearMateria);
router.put('/:id', materiaController.editarMateria);
router.delete('/:id', materiaController.eliminarMateria);
router.get('/', materiaController.listarMaterias);
router.get('/:id', materiaController.obtenerMateriaPorId);
router.get('/curso/:idCurso', materiaController.listarMateriasPorCurso);
router.post('/asignarProfesor', materiaController.asignarProfesorAMateria);
router.post('/asignarEstudiante', materiaController.asignarEstudianteAMateria);
router.delete('/removerUsuario', materiaController.removerUsuarioDeMateria);

module.exports = router;
