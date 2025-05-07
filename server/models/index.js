const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database/database.sqlite'),
  logging: false
});

// Define models
const User = require('./user')(sequelize, DataTypes);
const Task = require('./task')(sequelize, DataTypes);
const Report = require('./report')(sequelize, DataTypes);
const Template = require('./template')(sequelize, DataTypes);

// Define associations
User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(Report);
Report.belongsTo(User);

User.hasMany(Template);
Template.belongsTo(User);

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Task,
  Report,
  Template
};
