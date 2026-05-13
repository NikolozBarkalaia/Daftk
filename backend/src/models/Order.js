const { pool } = require('../config/db');
const Product = require('./Product');
const { randomUUID } = require('node:crypto');

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    token: row.token,
    userId: row.userId,
    items: typeof row.items === 'string' ? JSON.parse(row.items || '[]') : (row.items || []),
    shippingAddress: typeof row.shippingAddress === 'string' ? JSON.parse(row.shippingAddress || '{}') : (row.shippingAddress || {}),
    subtotal: row.subtotal,
    total: row.total,
    status: row.status,
    notes: row.notes || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const Order = {
  async create({ userId, items, shippingAddress, subtotal, total, notes }) {
    const token = randomUUID();
    const [result] = await pool.execute(
      `INSERT INTO orders (userId, token, items, shippingAddress, subtotal, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, token, JSON.stringify(items), JSON.stringify(shippingAddress), subtotal, total, notes || null]
    );

    // Decrease stock for each item (non-blocking, don't fail order if stock update fails)
    const stockUpdates = items
      .filter(item => item._id && item.selectedSize)
      .map(item => Product.decreaseStock(item._id, item.selectedSize, item.quantity || 1).catch(() => {}));
    await Promise.all(stockUpdates);

    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return format(rows[0] || null);
  },

  async findByToken(token) {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE token = ?', [token]);
    return format(rows[0] || null);
  },

  async findByUser(userId) {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return rows.map(format);
  },

  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows.map(format);
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(shippingAddress, '$.email')) = ? ORDER BY createdAt DESC`,
      [email]
    );
    return rows.map(format);
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },
};

module.exports = Order;

