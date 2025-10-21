const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const Materia = sequelize.define('Materia', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  idCurso: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'Cursos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  idProfesor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
  tableName: 'Materias',
  engine: 'InnoDB',
});

module.exports = Materia;
