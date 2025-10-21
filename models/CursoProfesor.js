// models/CursoProfesor.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const CursoProfesor = sequelize.define('CursoProfesor', {
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
  idProfesor: {
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
  tableName: 'CursoProfesor',
  timestamps: false,
});

module.exports = CursoProfesor;
