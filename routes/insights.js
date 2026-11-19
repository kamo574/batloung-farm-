const r = require('express').Router(), c = require('../controllers/insights');
r.get('/dashboard', c.dashboard);
r.get('/sales', c.sales);
r.get('/sales/:id', c.saleOne);
r.get('/purchases', c.purchases);
r.get('/purchases/:id', c.purchaseOne);
module.exports = r;