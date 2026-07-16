const AppError = require('../utils/AppError');

// Usage: requirePermission('users:write')
// Usage: requirePermission(['sales:read', 'sales:write']) -> requires ANY of these
function requirePermission(codes) {
  const required = Array.isArray(codes) ? codes : [codes];

  return function rbacMiddleware(req, res, next) {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const hasPermission = required.some((code) => req.user.permissions.includes(code));
    if (!hasPermission) {
      return next(
        new AppError('You do not have permission to perform this action', 403, {
          required,
        })
      );
    }
    next();
  };
}

// Usage: requireRole('admin') or requireRole(['admin', 'manager'])
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!allowed.includes(req.user.role_name)) {
      return next(new AppError('This action requires a different role', 403, { allowed }));
    }
    next();
  };
}

module.exports = { requirePermission, requireRole };
