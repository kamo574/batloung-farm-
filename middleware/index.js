class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const asyncH = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const required = (body, fields) => {
  const miss = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  if (miss.length) throw new HttpError(400, `Missing required field(s): ${miss.join(', ')}`);
};

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });

const errorHandler = (err, req, res, next) => {
  let status = err.status || 500, msg = err.message;
  if (err.code === 'ER_DUP_ENTRY') { status = 400; msg = 'Duplicate value: that record (phone/name) already exists'; }
  else if (err.code === 'ER_ROW_IS_REFERENCED_2') { status = 400; msg = 'Cannot delete: this record is used by other data'; }
  else if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ETIMEDOUT'].includes(err.code)) { status = 503; msg = 'Database unavailable. Please try again shortly.'; }
  else if (err.code && err.code.startsWith('ER_') && !err.status) { status = 400; msg = 'Invalid data: ' + err.sqlMessage; }
  else if (status === 500) { console.error(err); msg = 'Unexpected server error'; }
  res.status(status).json({ success: false, message: msg });
};
module.exports = { HttpError, asyncH, required, notFound, errorHandler };