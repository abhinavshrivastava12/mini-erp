const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'departments',
  columns: ['name', 'description'],
  resourceName: 'Department',
  permissionPrefix: 'departments',
});
