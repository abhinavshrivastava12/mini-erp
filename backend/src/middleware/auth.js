const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token, loads the user + role + permissions,
// and confirms the session is still active (not logged out elsewhere).
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Missing or invalid Authorization header', 401);
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const sessionResult = await pool.query(
    `SELECT id FROM user_sessions WHERE token_id = $1 AND is_active = true`,
    [payload.jti]
  );
  if (sessionResult.rowCount === 0) {
    throw new AppError('Session has expired or been logged out', 401);
  }

  const userResult = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.is_active, u.department_id,
            r.id AS role_id, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [payload.sub]
  );

  if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
    throw new AppError('User not found or inactive', 401);
  }

  const permResult = await pool.query(
    `SELECT p.code FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = $1`,
    [userResult.rows[0].role_id]
  );

  req.user = {
    ...userResult.rows[0],
    permissions: permResult.rows.map((r) => r.code),
    tokenId: payload.jti,
  };

  next();
});

module.exports = { authenticate };
