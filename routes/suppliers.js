const r = require('express').Router(), c = require('../controllers/supplier');
r.route('/suppliers').get(c.list).post(c.create);
r.route('/suppliers/:id').get(c.get).put(c.update).delete(c.remove);
module.exports = r;