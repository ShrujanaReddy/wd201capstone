'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chapter.belongsTo(models.Course, {
        foreignKey: 'courseId',
        onDelete: 'CASCADE',
      })
      Chapter.hasMany(models.Page, {
      foreignKey: 'chapterId',
      onDelete: 'CASCADE',
      })
    }
    static addChap({title,courseId}) {
      return this.create({
        title: title,
        courseId: courseId,
      })
    }
    static getChapters(courseId) {
      return this.findAll({
        where : {
          courseId
        }
      })
    }
  }
  Chapter.init({
    title: DataTypes.STRING,
    courseId: DataTypes.INTEGER,
    chapterNo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chapter',
    hooks: {
        beforeCreate: async (chapter) => {
          // Automatically assign the next chapter number
          if (!chapter.chapterNo) {
            const maxChapterNumber = await Chapter.max('chapterNo', {
              where: { courseId: chapter.courseId },
            });
            chapter.chapterNo = (maxChapterNumber || 0) + 1;
          }
        },
      },
  });
  return Chapter;
};