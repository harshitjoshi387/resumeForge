'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExportModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.belongsTo(models.user, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }
  ExportModel.init({
    format: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    documentId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'export',
  });
  return ExportModel;
};