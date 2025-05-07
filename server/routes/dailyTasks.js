const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const { Op } = require('sequelize');

// GET /api/daily-tasks?date=YYYY-MM-DD&from=YYYY-MM-DD&to=YYYY-MM-DD&planType=plan
router.get('/', async (req, res) => {
  try {
    const { date, weekStart, weekEnd, from, to, planType } = req.query;
    let where = {};
    if (date) {
      where.date = date;
    } else if (weekStart && weekEnd) {
      where.date = { [Op.between]: [weekStart, weekEnd] };
    } else if (from && to) {
      where.date = { [Op.between]: [from, to] };
    }
    if (planType) {
      where.planType = planType;
    }
    const tasks = await Task.findAll({ where, order: [['date', 'ASC'], ['id', 'ASC']] });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/daily-tasks
router.post('/', async (req, res) => {
  try {
    // req.body should be an array of tasks or a single task
    const tasks = Array.isArray(req.body) ? req.body : [req.body];
    const created = await Task.bulkCreate(tasks);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error saving daily tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/daily-tasks/:id (update doResult, status, movedToDate, isCanceled, etc)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Only allow updating certain fields
    const fields = [
      'doResult', 'status', 'movedToDate', 'isCanceled', 'date', 'content', 'planType', 'priority', 'notes', 'category', 'check', 'action'
    ];
    const updateData = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    await task.update(updateData);
    res.json(task);
  } catch (error) {
    console.error('Error updating daily task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/daily-tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting daily task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
