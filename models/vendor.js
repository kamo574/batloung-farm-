const { pool } = require('../config/db');
const m = require('./base')('Vendors', 'vendor_id',
  ['vendor_name', 'phone_number', 'location', 'registration_date']);
m.search = async q => (await pool.query(
  'SELECT * FROM Vendors WHERE vendor_name LIKE ? OR phone_number LIKE ?', [`%${q}%`, `%${q}%`]))[0];
m.balances = async () => (await pool.query(
  'SELECT vendor_id, vendor_name, outstanding_balance FROM Vendors ORDER BY outstanding_balance DESC'))[0];
module.exports = m;