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
      // define association here
      Section.belongsTo(models.Document, { foreignKey: 'documentId' });
      Section.hasMany(models.Item, { foreignKey: 'sectionId' });
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