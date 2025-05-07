const express = require('express');
const router = express.Router();
const { Template, User } = require('../models');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['name', 'ASC']]
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    if (!template) {
      return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new template
router.post('/', async (req, res) => {
  try {
    const newTemplate = await Template.create(req.body);
    
    // Fetch the created template with user information
    const template = await Template.findByPk(newTemplate.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a template
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' });
    }
    
    await template.update(req.body);
    
    // Fetch the updated template with user information
    const updatedTemplate = await Template.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' });
    }
    
    await template.destroy();
    res.json({ message: '템플릿이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get templates by category
router.get('/category/:category', async (req, res) => {
  try {
    const templates = await Template.findAll({
      where: { category: req.params.category },
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['name', 'ASC']]
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
