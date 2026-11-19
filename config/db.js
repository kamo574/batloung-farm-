require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true, connectionLimit: 10, connectTimeout: 10000,
  enableKeepAlive: true, decimalNumbers: true, dateStrings: true
});

async function testConnection() {
  try { const c = await pool.getConnection(); c.release(); console.log('✅ MySQL connected'); return true; }
  catch (e) { console.error('❌ MySQL connection failed:', e.message); return false; }
}
async function pingDb() {
  try { await pool.query('SELECT 1'); return true; } catch { return false; }
}
module.exports = { pool, testConnection, pingDb };