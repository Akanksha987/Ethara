const router = require('express').Router();

router.use(require('@routes/auth'));
router.use(require('@routes/user'));
router.use(require('@routes/projects'));
router.use(require('@routes/tasks'));

module.exports = router;