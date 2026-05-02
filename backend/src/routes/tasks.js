const express = require('express');
const router = express.Router();
const taskController = require('@controllers/task.js');
const { requireAuth } = require('@util/auth.js');

router.post('/api/projects/:projectId/tasks', requireAuth, taskController.createTask);
router.get('/api/tasks', requireAuth, taskController.getTasks);
router.get('/api/tasks/:id', requireAuth, taskController.getTaskById);
router.put('/api/tasks/:id', requireAuth, taskController.updateTask);
router.get('/api/dashboard', requireAuth, taskController.getDashboard);

module.exports = router;
