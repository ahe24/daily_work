"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tasks", "check", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("Tasks", "action", {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Tasks", "check");
    await queryInterface.removeColumn("Tasks", "action");
  }
};
