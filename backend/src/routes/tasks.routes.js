const { buildCrudRouter } = require('../core/buildCrudRouter');

module.exports = buildCrudRouter({
  table: 'tasks',
  columns: ['project_id', 'title', 'status', 'priority', 'assignee_id', 'due_date'],
  resourceName: 'Task',
  permissionPrefix: 'tasks',
});
