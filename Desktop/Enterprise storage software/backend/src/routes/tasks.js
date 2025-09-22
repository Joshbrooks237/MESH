const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
  assignedTo: Joi.number().integer().optional()
});

// Get all tasks for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Simple approach: get all tasks for the user, then filter in JavaScript
    const rawTasks = await pgConnection('tasks')
      .select('*')
      .orderBy('created_at', 'desc');

    // Get user info for joins
    const users = await pgConnection('users').select('id', 'first_name', 'last_name');

    // Filter tasks and add user info in JavaScript
    const allTasks = rawTasks
      .filter(task => task.assigned_to === userId || task.created_by === userId)
      .map(task => {
        const creator = users.find(u => u.id === task.created_by);
        const assignee = users.find(u => u.id === task.assigned_to);

        return {
          ...task,
          creator_first_name: creator?.first_name || null,
          creator_last_name: creator?.last_name || null,
          assignee_first_name: assignee?.first_name || null,
          assignee_last_name: assignee?.last_name || null,
        };
      });

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      due_before,
      due_after,
      assigned_to_me,
      created_by_me
    } = req.query;

    // Filter in JavaScript
    let filteredTasks = allTasks;

    if (assigned_to_me === 'true') {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === userId);
    } else if (created_by_me === 'true') {
      filteredTasks = filteredTasks.filter(task => task.created_by === userId);
    }

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (due_before) {
      filteredTasks = filteredTasks.filter(task => task.due_date && task.due_date <= due_before);
    }
    if (due_after) {
      filteredTasks = filteredTasks.filter(task => task.due_date && task.due_date >= due_after);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const tasks = filteredTasks.slice(offset, offset + limit);

    // Calculate total count from filtered results
    const totalItems = filteredTasks.length;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalItems,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      code: 'FETCH_TASKS_ERROR'
    });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await pgConnection('tasks')
      .select(
        'tasks.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name'
      )
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .where('tasks.id', id)
      .where(function() {
        this.where('tasks.assigned_to', userId).orWhere('tasks.created_by', userId);
      })
      .first();

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      code: 'FETCH_TASK_ERROR'
    });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const taskData = {
      user_id: userId,
      created_by: userId,
      title: value.title,
      description: value.description,
      due_date: value.dueDate,
      priority: value.priority,
      status: value.status,
      assigned_to: value.assignedTo,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [taskId] = await pgConnection('tasks').insert(taskData).returning('id');

    const task = await pgConnection('tasks')
      .select(
        'tasks.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name'
      )
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .where('tasks.id', taskId)
      .first();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Failed to create task',
      code: 'CREATE_TASK_ERROR'
    });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if task exists and user has access
    const existingTask = await pgConnection('tasks')
      .where('id', id)
      .where(function() {
        this.where('assigned_to', userId).orWhere('created_by', userId);
      })
      .first();

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const updateData = {
      title: value.title,
      description: value.description,
      due_date: value.dueDate,
      priority: value.priority,
      status: value.status,
      assigned_to: value.assignedTo,
      updated_at: new Date()
    };

    // Auto-complete task if status is completed
    if (value.status === 'completed' && existingTask.status !== 'completed') {
      updateData.is_completed = true;
      updateData.completed_at = new Date();
    } else if (value.status !== 'completed') {
      updateData.is_completed = false;
      updateData.completed_at = null;
    }

    await pgConnection('tasks')
      .where('id', id)
      .update(updateData);

    const task = await pgConnection('tasks')
      .select(
        'tasks.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name'
      )
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .where('tasks.id', id)
      .first();

    res.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Failed to update task',
      code: 'UPDATE_TASK_ERROR'
    });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if task exists and user has access
    const existingTask = await pgConnection('tasks')
      .where('id', id)
      .where(function() {
        this.where('assigned_to', userId).orWhere('created_by', userId);
      })
      .first();

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    await pgConnection('tasks')
      .where('id', id)
      .del();

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      code: 'DELETE_TASK_ERROR'
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if task exists and user has access
    const existingTask = await pgConnection('tasks')
      .where('id', id)
      .where(function() {
        this.where('assigned_to', userId).orWhere('created_by', userId);
      })
      .first();

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    const newCompletedStatus = !existingTask.is_completed;
    const updateData = {
      is_completed: newCompletedStatus,
      status: newCompletedStatus ? 'completed' : 'pending',
      completed_at: newCompletedStatus ? new Date() : null,
      updated_at: new Date()
    };

    await pgConnection('tasks')
      .where('id', id)
      .update(updateData);

    const task = await pgConnection('tasks')
      .select(
        'tasks.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name'
      )
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .where('tasks.id', id)
      .first();

    res.json({
      message: `Task ${newCompletedStatus ? 'completed' : 'marked as pending'}`,
      task
    });

  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({
      error: 'Failed to toggle task status',
      code: 'TOGGLE_TASK_ERROR'
    });
  }
});

module.exports = router;
