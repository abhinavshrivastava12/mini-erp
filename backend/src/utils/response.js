// Consistent API response envelope: { success, data, error, meta }

function ok(res, data, meta = undefined, status = 200) {
  return res.status(status).json({ success: true, data, error: null, meta });
}

function created(res, data, meta = undefined) {
  return ok(res, data, meta, 201);
}

function fail(res, message, status = 400, details = undefined) {
  return res.status(status).json({
    success: false,
    data: null,
    error: { message, details },
  });
}

module.exports = { ok, created, fail };
