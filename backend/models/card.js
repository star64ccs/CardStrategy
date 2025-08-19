'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Card.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    rarity: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    imageUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Card'
  });
  return Card;
};