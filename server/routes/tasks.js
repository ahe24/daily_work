const express = require('express');
const router = express.Router();
const { Task, User } = require('../models');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['date', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by date range
router.get('/range', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: '시작일과 종료일이 필요합니다.' });
  }
  
  try {
    const tasks = await Task.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['date', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    
    // Fetch the created task with user information
    const task = await Task.findByPk(newTask.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    await task.update(req.body);
    
    // Fetch the updated task with user information
    const updatedTask = await Task.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    await task.destroy();
    res.json({ message: '업무가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
