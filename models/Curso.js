const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const Curso = sequelize.define('Curso', {
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
  idProfesor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'Usuarios', // 🔹 coincide con Usuario.tableName
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
  tableName: 'Cursos',
  engine: 'InnoDB',
});

module.exports = Curso;
