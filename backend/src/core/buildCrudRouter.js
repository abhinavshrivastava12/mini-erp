const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { buildCrudModule } = require('./factory');

/**
 * Builds a full Express router for a domain module with RBAC applied:
 *   GET    /            -> requires <resource>:read
 *   GET    /:id         -> requires <resource>:read
 *   POST   /            -> requires <resource>:write
 *   PUT    /:id         -> requires <resource>:write
 *   DELETE /:id         -> requires <resource>:write
 */
function buildCrudRouter({ table, columns, resourceName, permissionPrefix, pk = 'id' }) {
  const { controller } = buildCrudModule({ table, columns, resourceName, pk });
  const router = express.Router();

  const readPerm = `${permissionPrefix}:read`;
  const writePerm = `${permissionPrefix}:write`;

  router.use(authenticate);

  router.get('/', requirePermission(readPerm), controller.list);
  router.get('/:id', requirePermission(readPerm), controller.get);
  router.post('/', requirePermission(writePerm), controller.create);
  router.put('/:id', requirePermission(writePerm), controller.update);
  router.delete('/:id', requirePermission(writePerm), controller.remove);

  return router;
}

module.exports = { buildCrudRouter };
