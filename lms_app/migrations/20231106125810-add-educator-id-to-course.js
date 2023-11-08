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
    await queryInterface.addColumn('Courses', 'educator_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users', // Name of the User table
        key: 'id',      // Name of the primary key in the User table
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Choose the appropriate action
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Courses', 'educator_id');
  }
};
