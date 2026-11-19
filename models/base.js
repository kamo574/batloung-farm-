const { pool } = require('../config/db');
module.exports = (table, id, fields) => ({
  all: async () => (await pool.query(`SELECT * FROM ${table} ORDER BY ${id}`))[0],
  byId: async v => (await pool.query(`SELECT * FROM ${table} WHERE ${id}=?`, [v]))[0][0],
  create: async b => (await pool.query(
    `INSERT INTO ${table} (${fields}) VALUES (${fields.map(() => '?')})`, fields.map(f => b[f] ?? null)))[0].insertId,
  update: async (v, b) => (await pool.query(
    `UPDATE ${table} SET ${fields.map(f => `${f}=COALESCE(?,${f})`)} WHERE ${id}=?`,
    [...fields.map(f => b[f] ?? null), v]))[0].affectedRows,
  remove: async v => (await pool.query(`DELETE FROM ${table} WHERE ${id}=?`, [v]))[0].affectedRows
});