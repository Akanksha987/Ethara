const express = require('express');
const router = express.Router();
const projectController = require('@controllers/project.js');
const { requireAuth, authorize } = require('@util/auth.js');

router.post('/api/projects', requireAuth, authorize(['Admin']), projectController.createProject);
router.get('/api/projects', requireAuth, projectController.getProjects);
router.get('/api/projects/:id', requireAuth, projectController.getProjectById);
router.put('/api/projects/:id', requireAuth, authorize(['Admin']), projectController.updateProject);
router.post('/api/projects/:id/members', requireAuth, authorize(['Admin']), projectController.addMember);
router.delete('/api/projects/:id/members/:memberId', requireAuth, authorize(['Admin']), projectController.removeMember);

module.exports = router;
