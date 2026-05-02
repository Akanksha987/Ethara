const express = require('express');
const router = express.Router();
const user = require('@controllers/user.js');
const { requireAuth, authorize } = require('@util/auth.js');

router.get('/api/users/me', requireAuth, user.getMe);
router.get('/api/users/:id', requireAuth, authorize(['Admin']), user.getUserById);
router.get('/api/users', requireAuth, authorize(['Admin']), user.getUsers);
router.put('/api/users', requireAuth, user.updateUser);
router.delete('/api/users/:id', requireAuth, user.deleteUser);

module.exports = router;