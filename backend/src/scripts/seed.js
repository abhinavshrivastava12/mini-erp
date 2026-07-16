/**
 * Seeds one demo user per role so the dynamic, role-based sidebar can be
 * demonstrated end-to-end. Run after applying db/schema.sql:
 *   npm run seed
 */
require('dotenv').config();
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/hash');

const DEMO_PASSWORD = 'Password@123';

const DEMO_USERS = [
  { full_name: 'System Administrator', email: 'admin@example.com', role: 'admin', department: null },
  { full_name: 'Sam Sales', email: 'sales@example.com', role: 'sales', department: 'Sales' },
  { full_name: 'Hannah HR', email: 'hr@example.com', role: 'hr', department: 'Human Resources' },
  { full_name: 'Eddie Engineer', email: 'engineering@example.com', role: 'engineering', department: 'Engineering' },
];

async function seed() {
  const password_hash = await hashPassword(DEMO_PASSWORD);

  for (const u of DEMO_USERS) {
    const roleResult = await pool.query(`SELECT id FROM roles WHERE name = $1`, [u.role]);
    if (roleResult.rowCount === 0) {
      throw new Error(`Role '${u.role}' not found. Run db/schema.sql first.`);
    }
    const roleId = roleResult.rows[0].id;

    let departmentId = null;
    if (u.department) {
      const deptResult = await pool.query(`SELECT id FROM departments WHERE name = $1`, [u.department]);
      departmentId = deptResult.rows[0]?.id || null;
    }

    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [u.email]);
    if (existing.rowCount > 0) {
      console.log(`User already exists (${u.email}). Skipping.`);
      continue;
    }

    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, department_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [u.full_name, u.email, password_hash, roleId, departmentId]
    );
    console.log(`Seeded ${u.role} user: ${u.email}`);
  }

  console.log('\nAll demo accounts use the password: ' + DEMO_PASSWORD);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
