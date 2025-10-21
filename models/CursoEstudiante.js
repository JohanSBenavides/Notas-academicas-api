// models/CursoEstudiante.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const CursoEstudiante = sequelize.define('CursoEstudiante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idCurso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cursos',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  idEstudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'CursoEstudiante',
  timestamps: false,
});

module.exports = CursoEstudiante;
