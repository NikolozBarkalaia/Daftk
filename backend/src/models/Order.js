const db = require('../config/db');

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
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
    const info = db.prepare(
      `INSERT INTO orders (userId, items, shippingAddress, subtotal, total, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      JSON.stringify(items),
      JSON.stringify(shippingAddress),
      subtotal,
      total,
      notes || null
    );
    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid));
  },

  findById(id) {
    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
  },

  findByUser(userId) {
    return db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(userId).map(format);
  },

  findAll() {
    return db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all().map(format);
  },

  updateStatus(id, status) {
    db.prepare(
      `UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?`
    ).run(status, id);
    return format(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
  },
};

module.exports = Order;
