const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');

/**
 * Builds a generic repository for a single table.
 *
 * @param {string} table - table name
 * @param {string[]} columns - whitelisted, insertable/updatable columns
 * @param {string} pk - primary key column name (default 'id')
 */
function createRepository(table, columns, pk = 'id') {
  return {
    async findAll({ limit = 100, offset = 0 } = {}) {
      const result = await pool.query(
        `SELECT * FROM ${table} ORDER BY ${pk} DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    },

    async count() {
      const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      return result.rows[0].count;
    },

    async findById(id) {
      const result = await pool.query(`SELECT * FROM ${table} WHERE ${pk} = $1`, [id]);
      return result.rows[0] || null;
    },

    async create(data) {
      const fields = columns.filter((c) => data[c] !== undefined);
      const values = fields.map((f) => data[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    },

    async update(id, data) {
      const fields = columns.filter((c) => data[c] !== undefined);
      if (fields.length === 0) return this.findById(id);

      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map((f) => data[f]);
      const result = await pool.query(
        `UPDATE ${table} SET ${setClause}, updated_at = now()
         WHERE ${pk} = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    },

    async remove(id) {
      const result = await pool.query(`DELETE FROM ${table} WHERE ${pk} = $1 RETURNING ${pk}`, [
        id,
      ]);
      return result.rowCount > 0;
    },
  };
}

function createService(repository, resourceName) {
  return {
    list: (query) => repository.findAll(query),
    count: () => repository.count(),
    get: async (id) => {
      const record = await repository.findById(id);
      if (!record) throw new AppError(`${resourceName} not found`, 404);
      return record;
    },
    create: (data) => repository.create(data),
    update: async (id, data) => {
      const existing = await repository.findById(id);
      if (!existing) throw new AppError(`${resourceName} not found`, 404);
      return repository.update(id, data);
    },
    remove: async (id) => {
      const existing = await repository.findById(id);
      if (!existing) throw new AppError(`${resourceName} not found`, 404);
      await repository.remove(id);
      return true;
    },
  };
}

function createController(service) {
  return {
    list: asyncHandler(async (req, res) => {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const [items, total] = await Promise.all([
        service.list({ limit, offset }),
        service.count(),
      ]);
      return ok(res, items, { total, limit, offset });
    }),

    get: asyncHandler(async (req, res) => {
      const record = await service.get(req.params.id);
      return ok(res, record);
    }),

    create: asyncHandler(async (req, res) => {
      const record = await service.create(req.body);
      return created(res, record);
    }),

    update: asyncHandler(async (req, res) => {
      const record = await service.update(req.params.id, req.body);
      return ok(res, record);
    }),

    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      return ok(res, { id: req.params.id, deleted: true });
    }),
  };
}

/**
 * One-call helper: builds repository + service + controller together
 * for a given table/domain module.
 */
function buildCrudModule({ table, columns, resourceName, pk = 'id' }) {
  const repository = createRepository(table, columns, pk);
  const service = createService(repository, resourceName);
  const controller = createController(service);
  return { repository, service, controller };
}

module.exports = { createRepository, createService, createController, buildCrudModule };
