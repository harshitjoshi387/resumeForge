'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Document.belongsTo(models.User, { foreignKey: 'userId' });
      Document.belongsTo(models.Template, { foreignKey: 'templateId' });
      Document.hasMany(models.Section, { foreignKey: 'documentId' });
      Document.hasMany(models.Version, { foreignKey: 'documentId' });
      Document.hasMany(models.Application, { foreignKey: 'documentId' });
      Document.hasOne(models.Share, { foreignKey: 'documentId' });
      Document.hasMany(models.Export, { foreignKey: 'documentId' });
    }
  }
  document.init({
    title: DataTypes.STRING,
    type: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    templateId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'document',
  });
  return document;
};