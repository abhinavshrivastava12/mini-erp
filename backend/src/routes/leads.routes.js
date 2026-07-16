const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'leads',
  columns: ['name', 'email', 'phone', 'source', 'status', 'owner_id', 'department_id', 'notes'],
  resourceName: 'Lead',
  permissionPrefix: 'leads',
});
