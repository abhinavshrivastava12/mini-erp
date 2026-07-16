const express = require('express');
const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created } = require('../utils/response');
const { validateBody } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register  (open registration; role name must be one of
// 'admin' | 'sales' | 'hr' | 'engineering' - defaults to 'sales' if omitted.
// In practice, admins normally create accounts via /api/users instead.)
router.post(
  '/register',
  validateBody({
    full_name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 6 },
  }),
  asyncHandler(async (req, res) => {
    const { full_name, email, password, department_id, role } = req.body;

    const roleResult = await pool.query(`SELECT id FROM roles WHERE name = $1`, [role || 'sales']);
    if (roleResult.rowCount === 0) {
      throw new AppError('Invalid role name', 422);
    }

    const password_hash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role_id, department_id, is_active, created_at`,
      [full_name, email, password_hash, roleResult.rows[0].id, department_id || null]
    );

    return created(res, result.rows[0]);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const userResult = await pool.query(
      `SELECT u.*, r.name AS role_name FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      throw new AppError('This account has been deactivated', 403);
    }

    const validPassword = await comparePassword(password, user.password_hash);
    if (!validPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const { token, jti } = signToken({ sub: user.id, role: user.role_name });

    await pool.query(
      `INSERT INTO user_sessions (user_id, token_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.id, jti, req.ip, req.headers['user-agent'] || null]
    );

    return ok(res, {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_name: user.role_name,
        department_id: user.department_id,
      },
    });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    await pool.query(
      `UPDATE user_sessions SET is_active = false, ended_at = now()
       WHERE token_id = $1`,
      [req.user.tokenId]
    );
    return ok(res, { loggedOut: true });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    return ok(res, req.user);
  })
);

module.exports = router;
