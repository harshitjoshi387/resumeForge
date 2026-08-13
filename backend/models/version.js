'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class version extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  version.init({
    snapshot: DataTypes.TEXT,
    label: DataTypes.STRING,
    documentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'version',
  });
  return version;
};