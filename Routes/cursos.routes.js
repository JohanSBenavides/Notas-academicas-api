const express = require('express');
const router = express.Router();
const cursoController = require('../Controllers/cursos.controller');

router.post('/', cursoController.crearCurso);
router.put('/:id', cursoController.editarCurso);
router.delete('/:id', cursoController.eliminarCurso);
router.get('/', cursoController.listarCursos);
router.get('/:id', cursoController.obtenerCursoPorId);
router.get('/profesor/:idProfesor', cursoController.listarCursosPorProfesor);
router.post('/asignarProfesor', cursoController.asignarProfesorACurso);
router.post('/asignarEstudiante', cursoController.asignarEstudianteACurso);
router.delete('/removerUsuario', cursoController.removerUsuarioDeCurso);
router.get('/:idCurso/usuarios', cursoController.listarUsuariosCurso);

module.exports = router;
