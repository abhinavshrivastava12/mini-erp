// Wraps an async route/controller function and forwards errors to Express'
// central error handler instead of requiring try/catch in every controller.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
