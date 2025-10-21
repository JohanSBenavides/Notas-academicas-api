const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

// ======================================================
// Crear un curso
// ======================================================
exports.crearCurso = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ msg: 'El nombre del curso es obligatorio' });

    const curso = await Curso.create({ nombre });
    res.status(201).json({ msg: 'Curso creado exitosamente', curso });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear el curso', error: error.message });
  }
};

// ======================================================
// Editar un curso
// ======================================================
exports.editarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

    curso.nombre = nombre || curso.nombre;
    await curso.save();

    res.json({ msg: 'Curso actualizado correctamente', curso });
  } catch (error) {
    res.status(500).json({ msg: 'Error al editar el curso', error: error.message });
  }
};

// ======================================================
// Eliminar un curso
// ======================================================
exports.eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

    await curso.destroy();
    res.json({ msg: 'Curso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar el curso', error: error.message });
  }
};

// ======================================================
// Listar todos los cursos (con profesores y estudiantes)
// ======================================================
exports.listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        { model: Usuario, as: 'Profesores', attributes: ['id', 'nombre', 'correo'] },
        { model: Usuario, as: 'Estudiantes', attributes: ['id', 'nombre', 'correo'] },
      ],
    });
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar los cursos', error: error.message });
  }
};

// ======================================================
// Obtener curso por ID (con relaciones)
// ======================================================
exports.obtenerCursoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findByPk(id, {
      include: [
        { model: Usuario, as: 'Profesores', attributes: ['id', 'nombre', 'correo'] },
        { model: Usuario, as: 'Estudiantes', attributes: ['id', 'nombre', 'correo'] },
      ],
    });

    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

    res.json(curso);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener el curso', error: error.message });
  }
};

// ======================================================
// Listar cursos por ID del profesor (rol 2)
// ======================================================
exports.listarCursosPorProfesor = async (req, res) => {
  try {
    const { idProfesor } = req.params;

    const profesor = await Usuario.findByPk(idProfesor, {
      include: { model: Curso, as: 'CursosDictados' },
    });

    if (!profesor) return res.status(404).json({ msg: 'Profesor no encontrado' });
    if (profesor.idRol !== 2) return res.status(403).json({ msg: 'El usuario no es un profesor' });

    res.json(profesor.CursosDictados);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar cursos del profesor', error: error.message });
  }
};

// ======================================================
// Asignar profesor a un curso
// ======================================================
exports.asignarProfesorACurso = async (req, res) => {
  try {
    const { idCurso, idProfesor } = req.body;

    const curso = await Curso.findByPk(idCurso);
    const profesor = await Usuario.findByPk(idProfesor);

    if (!curso || !profesor) return res.status(404).json({ msg: 'Curso o profesor no encontrado' });
    if (profesor.idRol !== 2) return res.status(403).json({ msg: 'El usuario no es un profesor' });

    await curso.addProfesores(profesor); // <- alias plural según belongsToMany
    res.json({ msg: 'Profesor asignado correctamente al curso' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al asignar profesor', error: error.message });
  }
};

// ======================================================
// Asignar estudiante a un curso
// ======================================================
exports.asignarEstudianteACurso = async (req, res) => {
  try {
    const { idCurso, idEstudiante } = req.body;

    const curso = await Curso.findByPk(idCurso);
    const estudiante = await Usuario.findByPk(idEstudiante);

    if (!curso || !estudiante) return res.status(404).json({ msg: 'Curso o estudiante no encontrado' });
    if (estudiante.idRol !== 3) return res.status(403).json({ msg: 'El usuario no es un estudiante' });

    await curso.addEstudiantes(estudiante); // <- alias plural según belongsToMany
    res.json({ msg: 'Estudiante asignado correctamente al curso' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al asignar estudiante', error: error.message });
  }
};

// ======================================================
// Remover profesor o estudiante de un curso
// ======================================================
exports.removerUsuarioDeCurso = async (req, res) => {
  try {
    const { idCurso, idUsuario } = req.body;

    const curso = await Curso.findByPk(idCurso);
    const usuario = await Usuario.findByPk(idUsuario);

    if (!curso || !usuario) return res.status(404).json({ msg: 'Curso o usuario no encontrado' });

    if (usuario.idRol === 2) {
      await curso.removeProfesores(usuario);
      res.json({ msg: 'Profesor removido del curso' });
    } else if (usuario.idRol === 3) {
      await curso.removeEstudiantes(usuario);
      res.json({ msg: 'Estudiante removido del curso' });
    } else {
      res.status(400).json({ msg: 'Solo se pueden remover profesores o estudiantes' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error al remover usuario del curso', error: error.message });
  }
};

// ======================================================
// Listar usuarios de un curso (profesores o estudiantes)
// ======================================================
exports.listarUsuariosCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const { rol } = req.query; // rol = 'profesor' | 'estudiante'

    const curso = await Curso.findByPk(idCurso, {
      include: [
        rol === 'profesor'
          ? { model: Usuario, as: 'Profesores', attributes: ['id', 'nombre', 'correo'] }
          : { model: Usuario, as: 'Estudiantes', attributes: ['id', 'nombre', 'correo'] },
      ],
    });

    if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

    res.json(rol === 'profesor' ? curso.Profesores : curso.Estudiantes);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar usuarios del curso', error: error.message });
  }
};
