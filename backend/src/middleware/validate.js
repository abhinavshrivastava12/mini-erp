const AppError = require('../utils/AppError');

// Lightweight body validator. `schema` is a map of field -> rules:
//   { required: true, type: 'string'|'number'|'boolean', enum: [...] }
// Kept dependency-free (no Joi/Zod) to minimize install footprint,
// but structured so it can be swapped for a schema library easily.
function validateBody(schema) {
  return function validateMiddleware(req, res, next) {
    const errors = [];
    const body = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const present = value !== undefined && value !== null && value !== '';

      if (rules.required && !present) {
        errors.push(`${field} is required`);
        continue;
      }
      if (!present) continue;

      if (rules.type === 'number' && typeof value !== 'number' && Number.isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 422, errors));
    }
    next();
  };
}

module.exports = { validateBody };
