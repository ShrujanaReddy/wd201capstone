const { DataTypes } = require("sequelize");
const { sequelize } = require("./connectDB.js");

const Course = sequelize.define(
  "Course",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "courses",
  }
);

// Define associations
Course.belongsTo(User, { as: "user", foreignKey: "userId" });
Course.hasMany(Chapter, { as: "chapters", foreignKey: "courseId" });

module.exports = Course;
Course.sync();
