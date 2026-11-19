const { asyncH, HttpError } = require('../middleware');
const m = require('../models/fruit');
const ST = ['Available', 'Out of Stock', 'Discontinued'];
const c = require('./crud')(m, 'Fruit', ['fruit_name'], b => {
  if (b.status && !ST.includes(b.status)) throw new HttpError(400, 'Invalid status. Use: ' + ST.join(', '));
});
c.list = asyncH(async (req, res) => {
  const data = req.query.all ? await m.all() : await m.available();
  res.json({ success: true, count: data.length, data });
});
c.stock = asyncH(async (req, res) => res.json({ success: true, data: await m.stock() }));
c.low = asyncH(async (req, res) => {
  const t = req.query.threshold === undefined ? +process.env.LOW_STOCK_THRESHOLD || 20 : Number(req.query.threshold);
  if (isNaN(t) || t < 0) throw new HttpError(400, 'threshold must be a positive number');
  const data = await m.low(t); res.json({ success: true, threshold: t, count: data.length, data });
});
module.exports = c;