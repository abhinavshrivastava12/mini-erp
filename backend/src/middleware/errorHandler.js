const { fail } = require('../utils/response');

// Must be registered last, after all routes.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isAppError) {
    return fail(res, err.message, err.status || 400, err.details);
  }

  // Postgres unique_violation
  if (err.code === '23505') {
    return fail(res, 'A record with this value already exists', 409);
  }
  // Postgres foreign_key_violation
  if (err.code === '23503') {
    return fail(res, 'Referenced record does not exist', 409);
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return fail(res, 'Internal server error', 500);
}

function notFoundHandler(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = { errorHandler, notFoundHandler };
