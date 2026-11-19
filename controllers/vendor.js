const { asyncH, HttpError } = require('../middleware');
const m = require('../models/vendor');
const c = require('./crud')(m, 'Vendor', ['vendor_name', 'phone_number', 'location'], b => {
  if (b.phone_number && !/^\+?\d{7,15}$/.test(b.phone_number)) throw new HttpError(400, 'phone_number must be 7-15 digits');
});
const create = c.create;
c.create = (req, res, next) => {
  if (req.body.registration_date === undefined) req.body.registration_date = new Date().toISOString().slice(0, 10);
  return create(req, res, next);
};
c.search = asyncH(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) throw new HttpError(400, 'Query parameter q (name or phone) is required');
  const data = await m.search(q); res.json({ success: true, count: data.length, data });
});
c.balances = asyncH(async (req, res) => res.json({ success: true, data: await m.balances() }));
module.exports = c;