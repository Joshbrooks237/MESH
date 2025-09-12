const express = require('express');
const router = express.Router();

// Mock project management data
const projectTasks = [
  {
    id: 'task-1',
    projectId: 'cancer-genome-2024',
    title: 'Variant Calling Pipeline',
    description: 'Process genomic data to identify genetic variants',
    status: 'in_progress',
    assignedTo: 'Dr. Sarah Johnson',
    priority: 'high',
    dueDate: '2024-10-15',
    progress: 75,
    subtasks: [
      { id: 'sub-1', title: 'Data preprocessing', completed: true },
      { id: 'sub-2', title: 'Variant calling algorithm', completed: true },
      { id: 'sub-3', title: 'Quality control', completed: false },
      { id: 'sub-4', title: 'Results validation', completed: false }
    ]
  }
];

// GET /api/projects/tasks - Get project tasks
router.get('/tasks', (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let filteredTasks = [...projectTasks];

    if (projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === projectId);
    }

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    res.json({
      success: true,
      data: filteredTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project tasks'
    });
  }
});

// POST /api/projects/tasks - Create new task
router.post('/tasks', (req, res) => {
  try {
    const newTask = {
      id: `task-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    projectTasks.push(newTask);

    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// PUT /api/projects/tasks/:id - Update task
router.put('/tasks/:id', (req, res) => {
  try {
    const taskIndex = projectTasks.findIndex(task => task.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const updatedTask = {
      ...projectTasks[taskIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    projectTasks[taskIndex] = updatedTask;

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /api/projects/tasks/:id - Delete task
router.delete('/tasks/:id', (req, res) => {
  try {
    const taskIndex = projectTasks.findIndex(task => task.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    projectTasks.splice(taskIndex, 1);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

module.exports = router;
