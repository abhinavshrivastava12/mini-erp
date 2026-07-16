const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'job_announcements',
  columns: ['title', 'description', 'department_id', 'status', 'posted_by'],
  resourceName: 'Job announcement',
  permissionPrefix: 'job_announcements',
});
