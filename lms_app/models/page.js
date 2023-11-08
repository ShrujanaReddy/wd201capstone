'use strict';
const {
  Model
} = require('sequelize');
const course = require('./course');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Page.belongsTo(models.Chapter, {
        foreignKey: 'chapterId',
        onDelete: 'CASCADE',
      })
    }
    static addPage({title,content,chapterId,courseId}) {
        return this.create({title:title,content:content,chapterId:chapterId,courseId:courseId})
    }
    static getPages({courseId,chapterId}) {
      return this.findAll({
        where : {
          courseId,
          chapterId
        }
      })
    }
  }
  Page.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    pageNo: DataTypes.INTEGER,
    chapterId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Page',
    hooks: {
        beforeCreate: async (page) => {
          const maxPageNumber = await Page.max('pageNo', {
            where: { chapterId: page.chapterId },
          });
          page.pageNo = (maxPageNumber || 0) + 1;
        },
      },
  });
  return Page;
};