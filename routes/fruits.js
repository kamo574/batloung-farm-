const r = require('express').Router(), c = require('../controllers/fruit');
r.route('/fruits').get(c.list).post(c.create);
r.route('/fruits/:id').get(c.get).put(c.update).delete(c.remove);
r.get('/stock', c.stock);
r.get('/stock/low', c.low);
module.exports = r;