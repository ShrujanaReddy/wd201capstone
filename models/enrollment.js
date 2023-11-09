'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Enrollment.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      Enrollment.belongsTo(models.Chapter, { foreignKey: 'chapterId', as: 'chapter' });
    }
  }
  Enrollment.init({
    completed: DataTypes.BOOLEAN,
    studentId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    chapterId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  return Enrollment;
};