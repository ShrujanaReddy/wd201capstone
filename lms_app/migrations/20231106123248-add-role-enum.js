'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return queryInterface.sequelize.transaction((t) => {
      return queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.ENUM('student', 'educator'),
        allowNull: false,
      }, { transaction: t });
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction((t) => {
      return queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.ENUM('student', 'educator'),
        allowNull: true,
      }, { transaction: t });
    });
  },
};
