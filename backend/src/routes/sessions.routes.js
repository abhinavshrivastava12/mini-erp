const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Helper: sum of completed session minutes today + live elapsed minutes
// of the current active session (if any), for the given user.
async function computeTodayWorkingMinutes(userId) {
  const completedResult = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes), 0)::int AS minutes
     FROM work_sessions
     WHERE user_id = $1
       AND is_active = false
       AND started_at::date = CURRENT_DATE`,
    [userId]
  );

  const activeResult = await pool.query(
    `SELECT started_at FROM work_sessions
     WHERE user_id = $1 AND is_active = true
     ORDER BY started_at DESC LIMIT 1`,
    [userId]
  );

  let liveMinutes = 0;
  if (activeResult.rowCount > 0) {
    const startedAt = new Date(activeResult.rows[0].started_at);
    liveMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  }

  return completedResult.rows[0].minutes + liveMinutes;
}

// POST /api/sessions/start - clock in
router.post(
  '/start',
  asyncHandler(async (req, res) => {
    const existing = await pool.query(
      `SELECT id FROM work_sessions WHERE user_id = $1 AND is_active = true`,
      [req.user.id]
    );
    if (existing.rowCount > 0) {
      throw new AppError('A session is already active. End it before starting a new one.', 409);
    }

    const result = await pool.query(
      `INSERT INTO work_sessions (user_id) VALUES ($1) RETURNING *`,
      [req.user.id]
    );
    return created(res, result.rows[0]);
  })
);

// POST /api/sessions/end - clock out
router.post(
  '/end',
  asyncHandler(async (req, res) => {
    const active = await pool.query(
      `SELECT id, started_at FROM work_sessions WHERE user_id = $1 AND is_active = true
       ORDER BY started_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (active.rowCount === 0) {
      throw new AppError('No active session to end.', 409);
    }

    const startedAt = new Date(active.rows[0].started_at);
    const durationMinutes = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 60000));

    const result = await pool.query(
      `UPDATE work_sessions
       SET is_active = false, ended_at = now(), duration_minutes = $2
       WHERE id = $1 RETURNING *`,
      [active.rows[0].id, durationMinutes]
    );
    return ok(res, result.rows[0]);
  })
);

// GET /api/sessions/current - current session status + today's working hours
router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const active = await pool.query(
      `SELECT id, started_at FROM work_sessions WHERE user_id = $1 AND is_active = true
       ORDER BY started_at DESC LIMIT 1`,
      [req.user.id]
    );
    const todayMinutes = await computeTodayWorkingMinutes(req.user.id);

    return ok(res, {
      isActive: active.rowCount > 0,
      startedAt: active.rows[0]?.started_at || null,
      todayWorkingMinutes: todayMinutes,
      todayWorkingHours: Math.round((todayMinutes / 60) * 100) / 100,
    });
  })
);

// GET /api/sessions/history - past work sessions for the current user
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT id, started_at, ended_at, duration_minutes, is_active
       FROM work_sessions WHERE user_id = $1
       ORDER BY started_at DESC LIMIT 100`,
      [req.user.id]
    );
    return ok(res, result.rows);
  })
);

module.exports = router;
