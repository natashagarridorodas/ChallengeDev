const { DataTypes } = require('sequelize');
const sequelize = require('../providers/db');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  club: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false,
  },
  edition: {
    type: DataTypes.INTEGER, // Edición de FIFA (2015 a 2023)
    allowNull: false,
  },
  pace: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shooting: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  passing: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  dribbling: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  defending: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  physical: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'players',
  timestamps: true,
});

module.exports = Player;