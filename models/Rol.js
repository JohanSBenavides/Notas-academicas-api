const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const Rol = sequelize.define('Rol', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: { 
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, { 
  timestamps: false,
  tableName: 'Roles',
  engine: 'InnoDB',
});

module.exports = Rol;
