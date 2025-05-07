const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/database.sqlite'),
  logging: false
});

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Import routes
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
const templateRoutes = require('./routes/templates');
const dailyTaskRoutes = require('./routes/dailyTasks');

// Use routes
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, sequelize };
