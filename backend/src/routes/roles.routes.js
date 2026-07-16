const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'roles',
  columns: ['name', 'description'],
  resourceName: 'Role',
  permissionPrefix: 'roles',
});
