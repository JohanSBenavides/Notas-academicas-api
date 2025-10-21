require('dotenv').config();
const { sequelize } = require('./conn');
const bcrypt = require('bcryptjs');

// Modelos
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');
const Materia = require('../models/Materia');
const Nota = require('../models/Nota');
const CursoProfesor = require('../models/CursoProfesor');
const CursoEstudiante = require('../models/CursoEstudiante');

async function crearDatosDePrueba(forceReset = false) {
  try {
    console.log(forceReset ? '⚠️ Reiniciando base de datos...' : '🧠 Creando datos de prueba...');
    await sequelize.sync({ force: forceReset });

    // =====================================================
    // ROLES
    // =====================================================
    const [adminRol] = await Rol.findOrCreate({ where: { nombre: 'Administrador' } });
    const [profesorRol] = await Rol.findOrCreate({ where: { nombre: 'Profesor' } });
    const [estudianteRol] = await Rol.findOrCreate({ where: { nombre: 'Estudiante' } });

    // =====================================================
    // CURSOS
    // =====================================================
    const [cursoA] = await Curso.findOrCreate({ where: { nombre: 'Curso A' } });
    const [cursoB] = await Curso.findOrCreate({ where: { nombre: 'Curso B' } });
    const [cursoC] = await Curso.findOrCreate({ where: { nombre: 'Curso C' } });

    // =====================================================
    // MATERIAS
    // =====================================================
    await Materia.bulkCreate([
      { nombre: 'Matemáticas', idCurso: cursoA.id },
      { nombre: 'Historia', idCurso: cursoB.id },
      { nombre: 'Inglés', idCurso: cursoA.id },
      { nombre: 'Ciencias', idCurso: cursoC.id },
    ], { ignoreDuplicates: true });

    const matematica = await Materia.findOne({ where: { nombre: 'Matemáticas' } });
    const historia = await Materia.findOne({ where: { nombre: 'Historia' } });
    const ingles = await Materia.findOne({ where: { nombre: 'Inglés' } });
    const ciencias = await Materia.findOne({ where: { nombre: 'Ciencias' } });

    // =====================================================
    // PROFESORES
    // =====================================================
    const passwordProfesor = await bcrypt.hash('profesor123', 10);
    const profesores = await Promise.all([
      Usuario.findOrCreate({
        where: { correo: 'profesor1@notas.com' },
        defaults: { nombre: 'Carlos Gómez', password: passwordProfesor, idRol: profesorRol.id },
      }),
      Usuario.findOrCreate({
        where: { correo: 'profesor2@notas.com' },
        defaults: { nombre: 'Ana López', password: passwordProfesor, idRol: profesorRol.id },
      }),
      Usuario.findOrCreate({
        where: { correo: 'profesor3@notas.com' },
        defaults: { nombre: 'Pedro Martínez', password: passwordProfesor, idRol: profesorRol.id },
      }),
    ]);
    const [profesor1, profesor2, profesor3] = profesores.map(([p]) => p);

    // =====================================================
    // ESTUDIANTES
    // =====================================================
    const passwordEstudiante = await bcrypt.hash('estudiante123', 10);
    const estudiantes = await Promise.all([
      Usuario.findOrCreate({
        where: { correo: 'est1@notas.com' },
        defaults: { nombre: 'Juan Pérez', password: passwordEstudiante, idRol: estudianteRol.id },
      }),
      Usuario.findOrCreate({
        where: { correo: 'est2@notas.com' },
        defaults: { nombre: 'María Ruiz', password: passwordEstudiante, idRol: estudianteRol.id },
      }),
      Usuario.findOrCreate({
        where: { correo: 'est3@notas.com' },
        defaults: { nombre: 'Andrés Torres', password: passwordEstudiante, idRol: estudianteRol.id },
      }),
      Usuario.findOrCreate({
        where: { correo: 'est4@notas.com' },
        defaults: { nombre: 'Laura Díaz', password: passwordEstudiante, idRol: estudianteRol.id },
      }),
    ]);
    const [est1, est2, est3, est4] = estudiantes.map(([e]) => e);

    // =====================================================
    // RELACIONES PROFESORES ↔ CURSOS
    // =====================================================
    await CursoProfesor.bulkCreate([
      { idCurso: cursoA.id, idProfesor: profesor1.id },
      { idCurso: cursoB.id, idProfesor: profesor2.id },
      { idCurso: cursoC.id, idProfesor: profesor3.id },
    ], { ignoreDuplicates: true });

    // =====================================================
    // RELACIONES ESTUDIANTES ↔ CURSOS
    // =====================================================
    await CursoEstudiante.bulkCreate([
      { idCurso: cursoA.id, idEstudiante: est1.id },
      { idCurso: cursoA.id, idEstudiante: est3.id },
      { idCurso: cursoB.id, idEstudiante: est2.id },
      { idCurso: cursoC.id, idEstudiante: est4.id },
    ], { ignoreDuplicates: true });

    // =====================================================
    // NOTAS
    // =====================================================
    await Nota.bulkCreate([
      { calificacion: 4.5, idMateria: matematica.id, idEstudiante: est1.id, idProfesor: profesor1.id },
      { calificacion: 3.8, idMateria: historia.id, idEstudiante: est2.id, idProfesor: profesor2.id },
      { calificacion: 5.0, idMateria: ingles.id, idEstudiante: est3.id, idProfesor: profesor1.id },
      { calificacion: 4.2, idMateria: ciencias.id, idEstudiante: est4.id, idProfesor: profesor3.id },
    ], { ignoreDuplicates: true });

    console.log('✅ Datos de prueba creados exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear datos de prueba:', err);
    process.exit(1);
  }
}

const forceReset = process.argv.includes('--force');
crearDatosDePrueba(forceReset);
