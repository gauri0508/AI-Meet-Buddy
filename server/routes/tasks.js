const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// GET /tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('meetingId', 'createdAt');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/dashboard - Get tasks grouped by status
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdue = await Task.find({
      deadline: { $lt: today },
      status: 'pending'
    }).populate('meetingId', 'createdAt');

    const todayTasks = await Task.find({
      deadline: { $gte: today, $lt: tomorrow },
      status: 'pending'
    }).populate('meetingId', 'createdAt');

    const upcoming = await Task.find({
      deadline: { $gte: tomorrow },
      status: 'pending'
    }).populate('meetingId', 'createdAt');

    res.json({
      overdue,
      today: todayTasks,
      upcoming
    });
  } catch (error) {
    console.error('Error fetching dashboard tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/calendar - Get tasks for calendar view
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const tasks = await Task.find({
      deadline: { $gte: startDate, $lte: endDate }
    }).populate('meetingId', 'createdAt');

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching calendar tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { task, assignee, deadline, priority, meetingId, tags } = req.body;

    if (!task || !meetingId) {
      return res.status(400).json({ error: 'Task description and meeting ID are required' });
    }

    const newTask = new Task({
      task,
      assignee: assignee || 'Not specified',
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || 'medium',
      meetingId,
      tags: tags || []
    });

    await newTask.save();
    await newTask.populate('meetingId', 'createdAt');

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert deadline string to Date if provided
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('meetingId', 'createdAt');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/search - Search tasks
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const tasks = await Task.find({
      $or: [
        { task: { $regex: q, $options: 'i' } },
        { assignee: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }).populate('meetingId', 'createdAt');

    res.json(tasks);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
