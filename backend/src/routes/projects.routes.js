const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'projects',
  columns: ['name', 'description', 'status', 'owner_id', 'department_id', 'due_date'],
  resourceName: 'Project',
  permissionPrefix: 'projects',
});
