const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'job_applications',
  columns: ['job_announcement_id', 'applicant_name', 'applicant_email', 'status', 'notes'],
  resourceName: 'Job application',
  permissionPrefix: 'job_applications',
});
