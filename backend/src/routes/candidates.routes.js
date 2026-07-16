const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'candidates',
  columns: ['full_name', 'email', 'position', 'status', 'department_id', 'notes'],
  resourceName: 'Candidate',
  permissionPrefix: 'candidates',
});
