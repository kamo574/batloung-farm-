const { asyncH, HttpError } = require('../middleware');
const m = require('../models/insights');
const id = req => {
  const n = Number(req.params.id);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'Invalid id');
  return n;
};
exports.dashboard = asyncH(async (req, res) => res.json({ success: true, data: await m.dashboard() }));
exports.sales = asyncH(async (req, res) => res.json({ success: true, data: await m.sales() }));
exports.purchases = asyncH(async (req, res) => res.json({ success: true, data: await m.purchases() }));
exports.saleOne = asyncH(async (req, res) => {
  const d = await m.sale(id(req));
  if (!d) throw new HttpError(404, 'Sale not found');
  res.json({ success: true, data: d });
});
exports.purchaseOne = asyncH(async (req, res) => {
  const d = await m.purchase(id(req));
  if (!d) throw new HttpError(404, 'Purchase not found');
  res.json({ success: true, data: d });
});