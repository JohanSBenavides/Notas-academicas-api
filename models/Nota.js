const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/conn');

const Nota = sequelize.define('Nota', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  idMateria: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'Materias', // 🔹 Debe coincidir con tableName
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  idProfesor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true, // 🔹 Debe ser true si onDelete es SET NULL
    references: {
      model: 'Usuarios',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  idEstudiante: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  calificacion: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
    },
  },
  observacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Notas',
  engine: 'InnoDB',
});

module.exports = Nota;
