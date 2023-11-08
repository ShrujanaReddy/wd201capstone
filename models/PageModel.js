const { DataTypes } = require("sequelize");
const { sequelize } = require("./connectDB.js");

const Page = sequelize.define(
  "Page",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "pages",
  }
);

// Define associations
Page.belongsTo(Chapter, { as: "chapter", foreignKey: "chapterId" });

module.exports = Page;
Page.sync();
