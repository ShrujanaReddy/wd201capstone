'use strict';
const { Model, Op, fn, col } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      Enrollment.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      Enrollment.belongsTo(models.Chapter, { foreignKey: 'chapterId', as: 'chapter' });
    }
    static async enrollStudent({studentId,courseId,chapters}) {
      const enrollmentData = chapters.map((chapter) => {
      return {
        courseId: courseId,
        studentId: studentId,
        chapterId: chapter.id,
        completed: false,
      }
      })
      await Enrollment.bulkCreate(enrollmentData);
    }
    static async checkCompletion({ studentId, courseId, chapterId }) {
      const enrollment = await Enrollment.findOne({
        where: {
          studentId: studentId,
          courseId: courseId,
          chapterId : chapterId
        },
      });
      return enrollment.completed;
    }

    static async markComplete({ courseId, studentId, chapterId }) {
      const enrollment = await Enrollment.update({completed:true},{
        where: {
          courseId: courseId,
          studentId: studentId,
          chapterId:chapterId
        },
      })
    }
  }

  Enrollment.init(
    {
      completed: DataTypes.BOOLEAN,
      studentId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER,
      chapterId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Enrollment',
    }
  );

  return Enrollment;
};
