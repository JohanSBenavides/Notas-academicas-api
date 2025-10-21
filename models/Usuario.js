const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  idRol: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'Usuarios',
  engine: 'InnoDB',
});

module.exports = Usuario;
