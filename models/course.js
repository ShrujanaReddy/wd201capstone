'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.belongsTo(models.User, {
        foreignKey: 'educator_id', 
        as: 'educator', 
      });
      Course.hasMany(models.Chapter, {
        foreignKey: 'courseId',
        onDelete: 'CASCADE',
      });
    }
    static getCourses() {
      return this.findAll()
    }
    static getmyCourses(educator_id) {
      return this.findAll({
        where: {
          educator_id
        }
      })
    }
    static createCourse({title,description,educator_id}) {
      return this.create({title:title,description:description,educator_id})
    }
  }
  Course.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    educator_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};