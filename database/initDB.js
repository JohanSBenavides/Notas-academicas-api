const { sequelize } = require('./conn');
const bcrypt = require('bcryptjs');

const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');
const Materia = require('../models/Materia');
const Nota = require('../models/Nota');
const CursoProfesor = require('../models/CursoProfesor');
const CursoEstudiante = require('../models/CursoEstudiante');

// ======================================================
// Definición de relaciones entre modelos
// ======================================================

// Rol ↔ Usuario (1:N)
Rol.hasMany(Usuario, { foreignKey: 'idRol', as: 'Usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'Rol' });

// Profesor ↔ Curso (1:N) — un profesor puede dictar varios cursos
Usuario.hasMany(Curso, { foreignKey: 'idProfesor', as: 'CursosPropios' });
Curso.belongsTo(Usuario, { foreignKey: 'idProfesor', as: 'ProfesorAsignado' });

// Curso ↔ Materia (1:N)
Curso.hasMany(Materia, { foreignKey: 'idCurso', as: 'Materias' });
Materia.belongsTo(Curso, { foreignKey: 'idCurso', as: 'Curso' });

// Materia ↔ Nota (1:N)
Materia.hasMany(Nota, { foreignKey: 'idMateria', as: 'Notas' });
Nota.belongsTo(Materia, { foreignKey: 'idMateria', as: 'Materia' });

// Estudiante ↔ Nota (1:N)
Usuario.hasMany(Nota, { foreignKey: 'idEstudiante', as: 'NotasRecibidas' });
Nota.belongsTo(Usuario, { foreignKey: 'idEstudiante', as: 'Estudiante' });

// Profesor ↔ Nota (1:N)
Usuario.hasMany(Nota, { foreignKey: 'idProfesor', as: 'NotasAsignadas' });
Nota.belongsTo(Usuario, { foreignKey: 'idProfesor', as: 'Profesor' });

// Profesores ↔ Cursos (N:M) — profesores colaboradores
Usuario.belongsToMany(Curso, {
  through: CursoProfesor,
  as: 'CursosColaborativos',
  foreignKey: 'idProfesor',
});
Curso.belongsToMany(Usuario, {
  through: CursoProfesor,
  as: 'ProfesoresColaboradores',
  foreignKey: 'idCurso',
});

// Estudiantes ↔ Cursos (N:M)
Usuario.belongsToMany(Curso, {
  through: CursoEstudiante,
  as: 'CursosInscritos',
  foreignKey: 'idEstudiante',
});
Curso.belongsToMany(Usuario, {
  through: CursoEstudiante,
  as: 'EstudiantesInscritos',
  foreignKey: 'idCurso',
});

// ======================================================
// Inicialización y sincronización de la base de datos
// ======================================================
async function inicializarBD() {
  try {
    console.log('Sincronizando modelos con la base de datos...');
    await sequelize.sync({ alter: true }); // usa { force: true } para reiniciar completamente
    console.log('Base de datos sincronizada correctamente.');

    // ==========================================
    // 1️⃣ Crear roles base (si no existen)
    // ==========================================
    const rolesBase = ['Administrador', 'Profesor', 'Estudiante'];
    for (const nombre of rolesBase) {
      await Rol.findOrCreate({ where: { nombre } });
    }

    // ==========================================
    // 2️⃣ Crear usuario administrador por defecto
    // ==========================================
    const adminCorreo = 'admin@notas.com';
    const adminExistente = await Usuario.findOne({ where: { correo: adminCorreo } });

    if (!adminExistente) {
      const rolAdmin = await Rol.findOne({ where: { nombre: 'Administrador' } });
      const hash = await bcrypt.hash('admin123', 10);

      await Usuario.create({
        nombre: 'Super Admin',
        correo: adminCorreo,
        password: hash,
        idRol: rolAdmin.id,
      });

      console.log('Super Admin creado: admin@notas.com / admin123');
    }

  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
  }
}

// ======================================================
// Exportación
// ======================================================
module.exports = { inicializarBD };
