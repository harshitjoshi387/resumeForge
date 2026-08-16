'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class section extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
      this.hasMany(models.item, { as: 'items', foreignKey: 'sectionId', onDelete: 'CASCADE' });
    }
  }
  section.init({
    heading: DataTypes.STRING,
    position: DataTypes.INTEGER,
    documentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'section',
  });
  return section;
};