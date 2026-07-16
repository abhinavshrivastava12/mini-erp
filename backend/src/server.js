require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('Database connection verified.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Mini ERP backend listening on http://localhost:${PORT}`);
  });
}

start();
