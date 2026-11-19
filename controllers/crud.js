const { asyncH, HttpError, required } = require('../middleware');
module.exports = (m, label, reqd, check = () => {}) => ({
  list: asyncH(async (req, res) => { const data = await m.all(); res.json({ success: true, count: data.length, data }); }),
  get: asyncH(async (req, res) => {
    const d = await m.byId(req.params.id);
    if (!d) throw new HttpError(404, `${label} not found`);
    res.json({ success: true, data: d });
  }),
  create: asyncH(async (req, res) => {
    check(req.body); required(req.body, reqd);
    const id = await m.create(req.body);
    res.status(201).json({ success: true, message: `${label} registered successfully`, data: await m.byId(id) });
  }),
  update: asyncH(async (req, res) => {
    check(req.body);
    if (!(await m.update(req.params.id, req.body))) throw new HttpError(404, `${label} not found`);
    res.json({ success: true, message: `${label} updated successfully`, data: await m.byId(req.params.id) });
  }),
  remove: asyncH(async (req, res) => {
    if (!(await m.remove(req.params.id))) throw new HttpError(404, `${label} not found`);
    res.json({ success: true, message: `${label} deleted successfully` });
  })
});