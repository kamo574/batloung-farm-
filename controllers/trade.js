const { asyncH, HttpError, required } = require('../middleware');
const m = require('../models/trade');
const SIZES = ['Small', 'Medium', 'Large'];

const checkItems = (items, needCost) => {
  if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'items must be a non-empty array');
  items.forEach((it, i) => {
    it.fruit_id = Number(it.fruit_id); it.quantity = Number(it.quantity); it.unit_cost = Number(it.unit_cost);
    if (!Number.isInteger(it.fruit_id) || it.fruit_id < 1) throw new HttpError(400, `Item ${i + 1}: invalid fruit_id`);
    if (!SIZES.includes(it.packaging_size)) throw new HttpError(400, `Item ${i + 1}: packaging_size must be Small, Medium or Large`);
    if (!Number.isInteger(it.quantity) || it.quantity < 1) throw new HttpError(400, `Item ${i + 1}: quantity must be a whole number above 0`);
    if (needCost && !(it.unit_cost > 0)) throw new HttpError(400, `Item ${i + 1}: unit_cost must be above 0`);
  });
};

exports.purchase = asyncH(async (req, res) => {
  required(req.body, ['supplier_id']); checkItems(req.body.items, true);
  res.status(201).json({ success: true, message: 'Purchase recorded and stock updated', data: await m.purchase(req.body) });
});
exports.sale = asyncH(async (req, res) => {
  required(req.body, ['vendor_id', 'payment_method']);
  if (!['Cash', 'Mobile Money', 'Credit'].includes(req.body.payment_method)) throw new HttpError(400, 'payment_method must be Cash, Mobile Money or Credit');
  checkItems(req.body.items, false);
  res.status(201).json({ success: true, message: 'Sale completed and stock reduced', data: await m.sale(req.body) });
});
exports.pay = asyncH(async (req, res) => {
  required(req.body, ['amount', 'method']);
  const a = Number(req.body.amount);
  if (!(a > 0)) throw new HttpError(400, 'amount must be above 0');
  if (!['Cash', 'Mobile Money'].includes(req.body.method)) throw new HttpError(400, 'method must be Cash or Mobile Money');
  res.json({ success: true, message: 'Payment recorded', data: await m.pay(req.params.id, a, req.body.method) });
});
exports.prices = asyncH(async (req, res) => res.json({ success: true, data: m.PRICES }));
exports.topFruits = asyncH(async (req, res) => res.json({ success: true, data: await m.topFruits() }));
exports.topVendor = asyncH(async (req, res) => res.json({ success: true, data: await m.topVendor() }));
exports.revenue = asyncH(async (req, res) => {
  const { from, to } = req.query, re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(from || '') || !re.test(to || '')) throw new HttpError(400, 'from and to are required as YYYY-MM-DD');
  res.json({ success: true, data: await m.revenue(from, to) });
});