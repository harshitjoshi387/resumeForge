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
      this.belongsTo(models.user, { foreignKey: 'userId', onDelete: 'CASCADE' });
      this.belongsTo(models.template, { foreignKey: 'templateId', onDelete: 'SET NULL' });
      this.hasMany(models.section, { as: 'sections', foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.hasMany(models.version, { foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.hasMany(models.application, { foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.hasOne(models.share, { foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.hasMany(models.export, { foreignKey: 'documentId', onDelete: 'CASCADE' });
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