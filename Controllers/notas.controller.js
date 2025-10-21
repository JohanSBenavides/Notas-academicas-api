// ======================================================
// Controlador de Notas
// ======================================================
const Nota = require('../models/Nota');
const Materia = require('../models/Materia');
const Usuario = require('../models/Usuario');
const { Op } = require('sequelize');

// ======================================================
// Crear una nueva nota
// ======================================================
exports.crearNota = async (req, res) => {
  try {
    const { valor, idMateria, idEstudiante, idProfesor } = req.body;

    if (!valor || !idMateria || !idEstudiante || !idProfesor)
      return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });

    if (valor < 1 || valor > 5)
      return res.status(400).json({ msg: 'La nota debe estar entre 1 y 5.' });

    const [materia, profesor, estudiante] = await Promise.all([
      Materia.findByPk(idMateria),
      Usuario.findByPk(idProfesor),
      Usuario.findByPk(idEstudiante),
    ]);

    if (!materia) return res.status(404).json({ msg: 'Materia no encontrada.' });
    if (!profesor || profesor.idRol !== 2)
      return res.status(403).json({ msg: 'El profesor no es válido o no tiene rol de profesor.' });
    if (!estudiante || estudiante.idRol !== 3)
      return res.status(403).json({ msg: 'El estudiante no es válido o no tiene rol de estudiante.' });

    // Validar asociaciones
    const [profesoresAsociados, estudiantesAsociados] = await Promise.all([
      materia.getProfesores(),
      materia.getEstudiantes(),
    ]);

    const profesorAsignado = profesoresAsociados.some(p => p.id === idProfesor);
    const estudianteAsignado = estudiantesAsociados.some(e => e.id === idEstudiante);

    if (!profesorAsignado)
      return res.status(403).json({ msg: 'El profesor no está asignado a esta materia.' });
    if (!estudianteAsignado)
      return res.status(403).json({ msg: 'El estudiante no está inscrito en esta materia.' });

    const nuevaNota = await Nota.create({ valor, idMateria, idEstudiante, idProfesor });
    res.status(201).json({ msg: 'Nota registrada correctamente.', nota: nuevaNota });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear la nota.', error: error.message });
  }
};

// ======================================================
// Actualizar nota (valor)
// ======================================================
exports.actualizarNota = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    const nota = await Nota.findByPk(id);
    if (!nota) return res.status(404).json({ msg: 'Nota no encontrada.' });

    if (valor < 1 || valor > 5)
      return res.status(400).json({ msg: 'La nota debe estar entre 1 y 5.' });

    nota.valor = valor;
    await nota.save();

    res.json({ msg: 'Nota actualizada correctamente.', nota });
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar la nota.', error: error.message });
  }
};

// ======================================================
// Eliminar una nota
// ======================================================
exports.eliminarNota = async (req, res) => {
  try {
    const { id } = req.params;

    const nota = await Nota.findByPk(id);
    if (!nota) return res.status(404).json({ msg: 'Nota no encontrada.' });

    await nota.destroy();
    res.json({ msg: 'Nota eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar la nota.', error: error.message });
  }
};

// ======================================================
// Listar todas las notas (con materia, profesor y estudiante)
// ======================================================
exports.listarNotas = async (req, res) => {
  try {
    const notas = await Nota.findAll({
      include: [
        { model: Materia, as: 'materia', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'estudiante', attributes: ['id', 'nombre', 'correo'] },
        { model: Usuario, as: 'profesor', attributes: ['id', 'nombre', 'correo'] },
      ],
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al listar las notas.', error: error.message });
  }
};

// ======================================================
// Filtrar notas por estudiante
// ======================================================
exports.filtrarPorEstudiante = async (req, res) => {
  try {
    const { idEstudiante } = req.params;

    const notas = await Nota.findAll({
      where: { idEstudiante },
      include: [{ model: Materia, as: 'materia', attributes: ['id', 'nombre'] }],
    });

    res.json(notas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al filtrar notas por estudiante.', error: error.message });
  }
};

// ======================================================
// Filtrar notas por materia
// ======================================================
exports.filtrarPorMateria = async (req, res) => {
  try {
    const { idMateria } = req.params;

    const notas = await Nota.findAll({
      where: { idMateria },
      include: [
        { model: Usuario, as: 'estudiante', attributes: ['id', 'nombre', 'correo'] },
        { model: Usuario, as: 'profesor', attributes: ['id', 'nombre', 'correo'] },
      ],
    });

    res.json(notas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al filtrar notas por materia.', error: error.message });
  }
};

// ======================================================
// Filtrar notas por materia y rango de valor
// ======================================================
exports.filtrarPorMateriaYRango = async (req, res) => {
  try {
    const { idMateria } = req.params;
    const { min = 1, max = 5 } = req.query;

    const notas = await Nota.findAll({
      where: {
        idMateria,
        valor: { [Op.between]: [Number(min), Number(max)] },
      },
      include: [
        { model: Usuario, as: 'estudiante', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'profesor', attributes: ['id', 'nombre'] },
      ],
    });

    res.json(notas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al filtrar notas por rango.', error: error.message });
  }
};
