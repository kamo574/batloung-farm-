const { pool } = require('../config/db');
const { HttpError } = require('../middleware');
const PRICES = { Small: +process.env.PRICE_SMALL, Medium: +process.env.PRICE_MEDIUM, Large: +process.env.PRICE_LARGE };
const r2 = n => Math.round(n * 100) / 100;
exports.PRICES = PRICES;

// ---- PURCHASE (transaction: all items succeed or nothing is saved) ----
exports.purchase = async ({ supplier_id, purchase_date, items }) => {
  const c = await pool.getConnection();
  try {
    await c.query('BEGIN');
    const [[sup]] = await c.query('SELECT supplier_id FROM Suppliers WHERE supplier_id=?', [supplier_id]);
    if (!sup) throw new HttpError(404, 'Supplier not found');
    const [p] = await c.query('INSERT INTO Purchases (supplier_id,purchase_date,total_amount) VALUES (?,COALESCE(?,CURDATE()),0)', [supplier_id, purchase_date || null]);
    let total = 0;
    for (const [i, it] of items.entries()) {
      const [[fr]] = await c.query('SELECT fruit_id FROM Fruits WHERE fruit_id=?', [it.fruit_id]);
      if (!fr) throw new HttpError(404, `Item ${i + 1}: fruit ${it.fruit_id} not found`);
      await c.query('INSERT INTO Purchase_details (purchase_id,fruit_id,quantity,unit_cost,packaging_size) VALUES (?,?,?,?,?)',
        [p.insertId, it.fruit_id, it.quantity, it.unit_cost, it.packaging_size]);
      await c.query(`INSERT INTO Stock (fruit_id,packaging_size,available_quantity) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE available_quantity=available_quantity+VALUES(available_quantity)`,
        [it.fruit_id, it.packaging_size, it.quantity]);
      total += it.quantity * it.unit_cost;
    }
    total = r2(total);
    await c.query('UPDATE Purchases SET total_amount=? WHERE purchase_id=?', [total, p.insertId]);
    await c.query('COMMIT');
    return { purchase_id: p.insertId, supplier_id, total_amount: total, items_count: items.length };
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; }
  finally { c.release(); }
};

// ---- SALE (locks stock rows, rejects whole sale if any item is short) ----
exports.sale = async ({ vendor_id, payment_method, amount_paid, items }) => {
  const c = await pool.getConnection();
  try {
    await c.query('BEGIN');
    const [[v]] = await c.query('SELECT vendor_id FROM Vendors WHERE vendor_id=? FOR UPDATE', [vendor_id]);
    if (!v) throw new HttpError(404, 'Vendor not found');
    const [s] = await c.query('INSERT INTO Sales (vendor_id,sale_date,total_amount,payment_method) VALUES (?,CURDATE(),0,?)', [vendor_id, payment_method]);
    let total = 0; const lines = [];
    for (const [i, it] of items.entries()) {
      const [[st]] = await c.query(
        `SELECT s.available_quantity AS a, f.fruit_name AS n FROM Stock s JOIN Fruits f ON f.fruit_id=s.fruit_id
         WHERE s.fruit_id=? AND s.packaging_size=? FOR UPDATE`, [it.fruit_id, it.packaging_size]);
      if (!st) throw new HttpError(404, `Item ${i + 1}: no stock record for fruit ${it.fruit_id} (${it.packaging_size})`);
      if (st.a < it.quantity)
        throw new HttpError(400, `Item ${i + 1}: only ${st.a} ${it.packaging_size} box(es) of ${st.n} available but ${it.quantity} requested. Sale rejected, stock unchanged.`);
      const price = PRICES[it.packaging_size], line = r2(price * it.quantity);
      await c.query('INSERT INTO Sales_details (sale_id,fruit_id,packaging_size,quantity,unit_price) VALUES (?,?,?,?,?)',
        [s.insertId, it.fruit_id, it.packaging_size, it.quantity, price]);
      await c.query('UPDATE Stock SET available_quantity=available_quantity-? WHERE fruit_id=? AND packaging_size=?',
        [it.quantity, it.fruit_id, it.packaging_size]);
      total += line; lines.push({ fruit: st.n, size: it.packaging_size, quantity: it.quantity, unit_price: price, line_total: line });
    }
    total = r2(total);
    const paid = (amount_paid === undefined || amount_paid === null || amount_paid === '')
      ? (payment_method === 'Credit' ? 0 : total) : Number(amount_paid);
    if (isNaN(paid) || paid < 0 || paid > total) throw new HttpError(400, `amount_paid must be between 0 and ${total}`);
    const status = paid >= total ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    await c.query('UPDATE Sales SET total_amount=?,amount_paid=?,payment_status=? WHERE sale_id=?', [total, paid, status, s.insertId]);
    await c.query('UPDATE Vendors SET outstanding_balance=outstanding_balance+? WHERE vendor_id=?', [r2(total - paid), vendor_id]);
    await c.query('COMMIT');
    return { sale_id: s.insertId, total_amount: total, amount_paid: paid, outstanding: r2(total - paid), payment_status: status, items: lines };
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; }
  finally { c.release(); }
};

// ---- VENDOR PAYMENT (settles oldest unpaid sales first) ----
exports.pay = async (id, amount, method) => {
  const c = await pool.getConnection();
  try {
    await c.query('BEGIN');
    const [[v]] = await c.query('SELECT outstanding_balance AS b FROM Vendors WHERE vendor_id=? FOR UPDATE', [id]);
    if (!v) throw new HttpError(404, 'Vendor not found');
    if (amount > v.b) throw new HttpError(400, `Payment exceeds outstanding balance of M${v.b}`);
    const [rows] = await c.query("SELECT sale_id,total_amount-amount_paid AS due FROM Sales WHERE vendor_id=? AND payment_status<>'PAID' ORDER BY sale_date,sale_id", [id]);
    let left = amount;
    for (const r of rows) {
      if (left <= 0) break;
      const p = Math.min(left, r.due); left = r2(left - p);
      await c.query("UPDATE Sales SET amount_paid=amount_paid+?,payment_status=IF(amount_paid>=total_amount,'PAID','PARTIALLY_PAID') WHERE sale_id=?", [p, r.sale_id]);
    }
    await c.query('UPDATE Vendors SET outstanding_balance=outstanding_balance-? WHERE vendor_id=?', [amount, id]);
    await c.query('COMMIT');
    return { vendor_id: +id, paid: amount, method, outstanding_balance: r2(v.b - amount) };
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; }
  finally { c.release(); }
};

// ---- SQL REPORTS ----
exports.topFruits = async () => (await pool.query(
  `SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold FROM Sales_details sd
   JOIN Fruits f ON f.fruit_id=sd.fruit_id GROUP BY f.fruit_id,f.fruit_name ORDER BY boxes_sold DESC LIMIT 5`))[0];
exports.revenue = async (from, to) => (await pool.query(
  'SELECT COALESCE(SUM(total_amount),0) AS revenue, COUNT(*) AS sales_count FROM Sales WHERE sale_date BETWEEN ? AND ?', [from, to]))[0][0];
exports.topVendor = async () => (await pool.query(
  `SELECT v.vendor_name, SUM(sd.quantity) AS boxes_bought FROM Sales s
   JOIN Vendors v ON v.vendor_id=s.vendor_id JOIN Sales_details sd ON sd.sale_id=s.sale_id
   GROUP BY v.vendor_id,v.vendor_name ORDER BY boxes_bought DESC LIMIT 1`))[0];