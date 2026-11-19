const r = require('express').Router(), c = require('../controllers/vendor'), t = require('../controllers/trade');
r.route('/vendors').get(c.list).post(c.create);
r.get('/vendors/search', c.search);
r.get('/vendors/balances', c.balances);
r.route('/vendors/:id').get(c.get).put(c.update).delete(c.remove);
r.post('/vendors/:id/payments', t.pay);
module.exports = r;