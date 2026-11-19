const { pool } = require('../config/db');
const m = require('./base')('Fruits', 'fruit_id', ['fruit_name', 'description', 'status']);
const create = m.create;
m.create = async b => {
  const id = await create(b);
  await pool.query("INSERT IGNORE INTO Stock (fruit_id,packaging_size,available_quantity) VALUES (?,'Small',0),(?,'Medium',0),(?,'Large',0)", [id, id, id]);
  return id;
};
m.available = async () => (await pool.query("SELECT * FROM Fruits WHERE status='Available'"))[0];
m.stock = async () => (await pool.query(
  `SELECT f.fruit_id, f.fruit_name, s.packaging_size, s.available_quantity FROM Stock s
   JOIN Fruits f ON f.fruit_id=s.fruit_id ORDER BY f.fruit_id, FIELD(s.packaging_size,'Small','Medium','Large')`))[0];
m.low = async t => (await pool.query(
  `SELECT f.fruit_id, f.fruit_name, s.packaging_size, s.available_quantity FROM Stock s
   JOIN Fruits f ON f.fruit_id=s.fruit_id WHERE s.available_quantity<=? ORDER BY s.available_quantity`, [t]))[0];
module.exports = m;