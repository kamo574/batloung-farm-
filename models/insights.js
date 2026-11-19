const { pool } = require('../config/db');
const q = async (sql, p = []) => (await pool.query(sql, p))[0];

exports.dashboard = async () => {
  const [t, daily, stockByFruit, debtors, recent] = await Promise.all([
    q(`SELECT (SELECT COALESCE(SUM(total_amount),0) FROM Sales) AS revenue,
              (SELECT COALESCE(SUM(amount_paid),0) FROM Sales) AS collected,
              (SELECT COALESCE(SUM(total_amount),0) FROM Sales WHERE sale_date=CURDATE()) AS today,
              (SELECT COALESCE(SUM(total_amount),0) FROM Purchases) AS purchases_cost,
              (SELECT COALESCE(SUM(outstanding_balance),0) FROM Vendors) AS outstanding,
              (SELECT COUNT(*) FROM Vendors) AS vendors,
              (SELECT COUNT(*) FROM Suppliers) AS suppliers,
              (SELECT COUNT(*) FROM Sales) AS sales_count`),
    q(`SELECT DATE_FORMAT(sale_date,'%Y-%m-%d') AS d, SUM(total_amount) AS rev
       FROM Sales WHERE sale_date >= CURDATE() - INTERVAL 6 DAY GROUP BY sale_date`),
    q(`SELECT f.fruit_name, SUM(s.available_quantity) AS qty FROM Stock s
       JOIN Fruits f ON f.fruit_id=s.fruit_id GROUP BY f.fruit_id, f.fruit_name ORDER BY f.fruit_id`),
    q(`SELECT vendor_id, vendor_name, phone_number, outstanding_balance FROM Vendors
       WHERE outstanding_balance>0 ORDER BY outstanding_balance DESC LIMIT 5`),
    q(`(SELECT 'sale' AS type, s.sale_id AS id, v.vendor_name AS party, s.total_amount AS amount,
               DATE_FORMAT(s.sale_date,'%Y-%m-%d') AS d
        FROM Sales s JOIN Vendors v ON v.vendor_id=s.vendor_id)
       UNION ALL
       (SELECT 'purchase', p.purchase_id, sp.business_name, p.total_amount,
               DATE_FORMAT(p.purchase_date,'%Y-%m-%d')
        FROM Purchases p JOIN Suppliers sp ON sp.supplier_id=p.supplier_id)
       ORDER BY d DESC, id DESC LIMIT 6`)
  ]);
  return { totals: t[0], daily, stockByFruit, debtors, recent };
};

const SALE_SQL = `SELECT s.sale_id, v.vendor_name, DATE_FORMAT(s.sale_date,'%Y-%m-%d') AS sale_date,
  s.payment_method, s.payment_status, s.total_amount, s.amount_paid,
  ROUND(s.total_amount - s.amount_paid, 2) AS balance
  FROM Sales s JOIN Vendors v ON v.vendor_id=s.vendor_id`;
exports.sales = () => q(SALE_SQL + ' ORDER BY s.sale_id DESC');
exports.sale = async id => {
  const [s] = await q(SALE_SQL + ' WHERE s.sale_id=?', [id]);
  if (!s) return null;
  s.items = await q(`SELECT f.fruit_name, sd.packaging_size, sd.quantity, sd.unit_price,
    ROUND(sd.quantity*sd.unit_price,2) AS line_total FROM Sales_details sd
    JOIN Fruits f ON f.fruit_id=sd.fruit_id WHERE sd.sale_id=?`, [id]);
  return s;
};

const PUR_SQL = `SELECT p.purchase_id, sp.business_name, DATE_FORMAT(p.purchase_date,'%Y-%m-%d') AS purchase_date,
  p.total_amount, (SELECT COALESCE(SUM(quantity),0) FROM Purchase_details WHERE purchase_id=p.purchase_id) AS boxes
  FROM Purchases p JOIN Suppliers sp ON sp.supplier_id=p.supplier_id`;
exports.purchases = () => q(PUR_SQL + ' ORDER BY p.purchase_id DESC');
exports.purchase = async id => {
  const [p] = await q(PUR_SQL + ' WHERE p.purchase_id=?', [id]);
  if (!p) return null;
  p.items = await q(`SELECT f.fruit_name, pd.packaging_size, pd.quantity, pd.unit_cost AS unit_price,
    ROUND(pd.quantity*pd.unit_cost,2) AS line_total FROM Purchase_details pd
    JOIN Fruits f ON f.fruit_id=pd.fruit_id WHERE pd.purchase_id=?`, [id]);
  return p;
};