const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { hashPassword } = require('../utils/hash');

const router = express.Router();
router.use(authenticate);

// GET /api/users
router.get(
  '/',
  requirePermission('users:read'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_active, u.created_at,
              r.id AS role_id, r.name AS role_name,
              d.id AS department_id, d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       ORDER BY u.id DESC`
    );
    return ok(res, result.rows);
  })
);

// GET /api/users/:id
router.get(
  '/:id',
  requirePermission('users:read'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_active, u.created_at,
              r.id AS role_id, r.name AS role_name,
              d.id AS department_id, d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) throw new AppError('User not found', 404);
    return ok(res, result.rows[0]);
  })
);

// POST /api/users
router.post(
  '/',
  requirePermission('users:write'),
  validateBody({
    full_name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 6 },
    role_id: { required: true },
  }),
  asyncHandler(async (req, res) => {
    const { full_name, email, password, role_id, department_id, is_active } = req.body;
    const password_hash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, department_id, is_active)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, true))
       RETURNING id, full_name, email, role_id, department_id, is_active, created_at`,
      [full_name, email, password_hash, role_id, department_id || null, is_active]
    );
    return created(res, result.rows[0]);
  })
);

// PUT /api/users/:id
router.put(
  '/:id',
  requirePermission('users:write'),
  asyncHandler(async (req, res) => {
    const { full_name, email, role_id, department_id, is_active, password } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    const push = (col, val) => {
      fields.push(`${col} = $${i}`);
      values.push(val);
      i += 1;
    };

    if (full_name !== undefined) push('full_name', full_name);
    if (email !== undefined) push('email', email);
    if (role_id !== undefined) push('role_id', role_id);
    if (department_id !== undefined) push('department_id', department_id);
    if (is_active !== undefined) push('is_active', is_active);
    if (password) push('password_hash', await hashPassword(password));

    if (fields.length === 0) {
      throw new AppError('No fields provided to update', 422);
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $${i}
       RETURNING id, full_name, email, role_id, department_id, is_active, created_at`,
      values
    );
    if (result.rowCount === 0) throw new AppError('User not found', 404);
    return ok(res, result.rows[0]);
  })
);

// DELETE /api/users/:id
router.delete(
  '/:id',
  requirePermission('users:write'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
      req.params.id,
    ]);
    if (result.rowCount === 0) throw new AppError('User not found', 404);
    return ok(res, { id: req.params.id, deleted: true });
  })
);

module.exports = router;
