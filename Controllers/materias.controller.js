const Materia = require('../models/Materia');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Nota = require('../models/Nota');

// ======================================================
// Crear una materia
// ======================================================
exports.crearMateria = async (req, res) => {
  try {
    const { nombre, idCurso } = req.body;

    if (!nombre || !idCurso) {
      return res.status(400).json({ msg: 'El nombre y el curso son obligatorios.' });
    }

    const curso = await Curso.findByPk(idCurso);
    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado.' });

    const materia = await Materia.create({ nombre, idCurso });
    res.status(201).json({ msg: 'Materia creada exitosamente.', materia });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear la materia.', error: error.message });
  }
};

// ======================================================
// Editar una materia
// ======================================================
exports.editarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, idCurso } = req.body;

    const materia = await Materia.findByPk(id);
    if (!materia) return res.status(404).json({ msg: 'Materia no encontrada.' });

    if (idCurso) {
      const curso = await Curso.findByPk(idCurso);
      if (!curso) return res.status(404).json({ msg: 'Curso no encontrado.' });
      materia.idCurso = idCurso;
    }

    materia.nombre = nombre || materia.nombre;
    await materia.save();

    res.json({ msg: 'Materia actualizada correctamente.', materia });
  } catch (error) {
    res.status(500).json({ msg: 'Error al editar la materia.', error: error.message });
  }
};

// ======================================================
// Eliminar materia (solo si no tiene asociaciones)
// ======================================================
exports.eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;

    const materia = await Materia.findByPk(id);
    if (!materia) return res.status(404).json({ msg: 'Materia no encontrada.' });

    // Verificar si tiene notas
    const notas = await Nota.count({ where: { idMateria: id } });
    if (notas > 0) return res.status(400).json({ msg: 'No se puede eliminar: la materia tiene notas asociadas.' });

    await materia.destroy();
    res.json({ msg: 'Materia eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar la materia.', error: error.message });
  }
};

// ======================================================
// Listar todas las materias (con curso)
// ======================================================
exports.listarMaterias = async (req, res) => {
  try {
    const materias = await Materia.findAll({
      include: [{ model: Curso, as: 'curso' }],
    });
    res.json(materias);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar materias.', error: error.message });
  }
};

// ======================================================
// Obtener materia por ID (con curso, profesores y estudiantes)
// ======================================================
exports.obtenerMateriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const materia = await Materia.findByPk(id, {
      include: [
        { model: Curso, as: 'curso' },
        { model: Usuario, as: 'Profesores', attributes: ['id', 'nombre', 'correo'] },
        { model: Usuario, as: 'Estudiantes', attributes: ['id', 'nombre', 'correo'] },
        { model: Nota, as: 'notas' },
      ],
    });

    if (!materia) return res.status(404).json({ msg: 'Materia no encontrada.' });
    res.json(materia);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener la materia.', error: error.message });
  }
};

// ======================================================
// Listar materias por curso
// ======================================================
exports.listarMateriasPorCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;

    const curso = await Curso.findByPk(idCurso);
    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado.' });

    const materias = await Materia.findAll({
      where: { idCurso },
      include: [{ model: Curso, as: 'curso' }],
    });
    res.json(materias);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar materias del curso.', error: error.message });
  }
};

// ======================================================
// Asignar profesor a materia
// ======================================================
exports.asignarProfesorAMateria = async (req, res) => {
  try {
    const { idMateria, idProfesor } = req.body;

    const materia = await Materia.findByPk(idMateria);
    const profesor = await Usuario.findByPk(idProfesor);

    if (!materia || !profesor) return res.status(404).json({ msg: 'Materia o profesor no encontrado.' });
    if (profesor.idRol !== 2) return res.status(403).json({ msg: 'El usuario no es un profesor.' });

    await materia.addProfesores(profesor); // 🔹 Usa alias plural según belongsToMany
    res.json({ msg: 'Profesor asignado correctamente a la materia.' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al asignar profesor.', error: error.message });
  }
};

// ======================================================
// Asignar estudiante a materia
// ======================================================
exports.asignarEstudianteAMateria = async (req, res) => {
  try {
    const { idMateria, idEstudiante } = req.body;

    const materia = await Materia.findByPk(idMateria);
    const estudiante = await Usuario.findByPk(idEstudiante);

    if (!materia || !estudiante) return res.status(404).json({ msg: 'Materia o estudiante no encontrado.' });
    if (estudiante.idRol !== 3) return res.status(403).json({ msg: 'El usuario no es un estudiante.' });

    await materia.addEstudiantes(estudiante); // 🔹 Usa alias plural según belongsToMany
    res.json({ msg: 'Estudiante asignado correctamente a la materia.' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al asignar estudiante.', error: error.message });
  }
};

// ======================================================
// Remover usuario (profesor o estudiante) de una materia
// ======================================================
exports.removerUsuarioDeMateria = async (req, res) => {
  try {
    const { idMateria, idUsuario } = req.body;

    const materia = await Materia.findByPk(idMateria);
    const usuario = await Usuario.findByPk(idUsuario);

    if (!materia || !usuario) return res.status(404).json({ msg: 'Materia o usuario no encontrado.' });

    if (usuario.idRol === 2) {
      await materia.removeProfesores(usuario);
      res.json({ msg: 'Profesor removido de la materia.' });
    } else if (usuario.idRol === 3) {
      await materia.removeEstudiantes(usuario);
      res.json({ msg: 'Estudiante removido de la materia.' });
    } else {
      res.status(400).json({ msg: 'Solo se pueden remover profesores o estudiantes.' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error al remover usuario de la materia.', error: error.message });
  }
};
