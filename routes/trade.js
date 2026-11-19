const r = require('express').Router(), c = require('../controllers/trade');
r.post('/purchases', c.purchase);
r.post('/sales', c.sale);
r.get('/prices', c.prices);
r.get('/reports/top-fruits', c.topFruits);
r.get('/reports/top-vendor', c.topVendor);
r.get('/reports/revenue', c.revenue);
module.exports = r;