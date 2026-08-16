'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.document, { foreignKey: 'templateId' });
    }
  }
  template.init({
    name: DataTypes.STRING,
    config: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'template',
  });
  return template;
};