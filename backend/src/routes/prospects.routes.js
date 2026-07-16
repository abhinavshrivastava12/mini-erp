const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'prospects',
  columns: ['name', 'company', 'stage', 'owner_id', 'department_id', 'notes'],
  resourceName: 'Prospect',
  permissionPrefix: 'prospects',
});
