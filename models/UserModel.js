const { DataTypes } = require("sequelize");
const { sequelize } = require("./connectDB.js");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
  }
);

// Define associations
User.hasMany(Course, { as: "courses", foreignKey: "userId" });

module.exports = User;
User.sync();
