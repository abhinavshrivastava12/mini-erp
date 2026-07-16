const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/sessions', require('./sessions.routes'));
router.use('/users', require('./users.routes'));
router.use('/roles', require('./roles.routes'));
router.use('/departments', require('./departments.routes'));

// Sales module
router.use('/leads', require('./leads.routes'));
router.use('/prospects', require('./prospects.routes'));
router.use('/meetings', require('./meetings.routes'));

// HR module
router.use('/job-announcements', require('./jobAnnouncements.routes'));
router.use('/job-applications', require('./jobApplications.routes'));
router.use('/candidates', require('./candidates.routes'));

// Engineering module
router.use('/projects', require('./projects.routes'));
router.use('/tasks', require('./tasks.routes'));

module.exports = router;
