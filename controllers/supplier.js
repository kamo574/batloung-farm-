const { HttpError } = require('../middleware');
const PROV = ['Gauteng', 'Free State', 'KwaZulu-Natal', 'Western Cape', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West'];
module.exports = require('./crud')(require('../models/supplier'), 'Supplier',
  ['business_name', 'contact_person', 'phone', 'province', 'address'],
  b => { if (b.province && !PROV.includes(b.province)) throw new HttpError(400, 'Invalid province. Use: ' + PROV.join(', ')); });