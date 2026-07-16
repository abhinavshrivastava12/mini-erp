const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'meetings',
  columns: ['title', 'with_whom', 'scheduled_at', 'status', 'owner_id', 'department_id', 'notes'],
  resourceName: 'Meeting',
  permissionPrefix: 'meetings',
});
