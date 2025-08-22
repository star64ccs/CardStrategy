'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Collection.init(
    {
      userId: DataTypes.INTEGER,
      cardId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      acquiredAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Collection',
    }
  );
  return Collection;
};
