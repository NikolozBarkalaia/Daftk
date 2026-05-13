const db = require('../config/db');
const Product = require('./Product');
const { randomUUID } = require('node:crypto');

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    token: row.token,
    userId: row.userId,
    items: JSON.parse(row.items || '[]'),
    shippingAddress: JSON.parse(row.shippingAddress || '{}'),
    subtotal: row.subtotal,
    total: row.total,
    status: row.status,
    notes: row.notes || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const Order = {
  create({ userId, items, shippingAddress, subtotal, total, notes }) {
    const token = randomUUID();
    const info = db.prepare(
      `INSERT INTO orders (userId, token, items, shippingAddress, subtotal, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      token,
      JSON.stringify(items),
      JSON.stringify(shippingAddress),
      subtotal,
      total,
      notes || null
    );

    // Decrease stock for each item
    items.forEach(item => {
      if (item._id && item.selectedSize) {
        Product.decreaseStock(item._id, item.selectedSize, item.quantity || 1);
      }
    });

    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid));
  },

  findById(id) {
    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
  },

  findByToken(token) {
    return format(db.prepare('SELECT * FROM orders WHERE token = ?').get(token));
  },

  findByUser(userId) {
    return db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(userId).map(format);
  },

  findAll() {
    return db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all().map(format);
  },

  findByEmail(email) {
    return db
      .prepare('SELECT * FROM orders ORDER BY createdAt DESC')
      .all()
      .filter((row) => {
        try {
          const addr = JSON.parse(row.shippingAddress || '{}');
          return addr.email && addr.email.toLowerCase() === email.toLowerCase();
        } catch {
          return false;
        }
      })
      .map(format);
  },

  updateStatus(id, status) {
    db.prepare(
      `UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?`
    ).run(status, id);
    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
  },
};

module.exports = Order;
