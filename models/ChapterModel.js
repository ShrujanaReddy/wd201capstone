const { DataTypes } = require("sequelize");
const { sequelize } = require("./connectDB.js");

const Chapter = sequelize.define(
  "Chapter",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "chapters",
  }
);

// Define associations
Chapter.belongsTo(Course, { as: "course", foreignKey: "courseId" });
Chapter.hasMany(Page, { as: "pages", foreignKey: "chapterId" });

module.exports = Chapter;
Chapter.sync();
