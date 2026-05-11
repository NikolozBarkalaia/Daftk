const db = require('../config/db');

function now() { return new Date().toISOString(); }

function format(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    imageUrls: JSON.parse(row.imageUrls || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    isFeatured: row.isFeatured === 1,
    hasBadge: row.hasBadge === 1,
    badgeText: row.badgeText || null,
    badgeBgColor: row.badgeBgColor || '#000000',
    badgeTextColor: row.badgeTextColor || '#ffffff',
    sizeStock: JSON.parse(row.sizeStock || '{}'),
  };
}

const Product = {
  find({ category } = {}, { skip = 0, limit = 20 } = {}) {
    if (category) {
      return db.prepare(
        'SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?'
      ).all(category, limit, skip).map(format);
    }
    return db.prepare(
      'SELECT * FROM products ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    ).all(limit, skip).map(format);
  },

  countDocuments({ category } = {}) {
    if (category) {
      return db.prepare('SELECT COUNT(*) as c FROM products WHERE category = ?').get(category).c;
    }
    return db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  },

  findFeatured(limit = 8) {
    return db.prepare(
      'SELECT * FROM products WHERE isFeatured = 1 ORDER BY createdAt DESC LIMIT ?'
    ).all(limit).map(format);
  },

  findById(id) {
    return format(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
  },

  create({ name, description, price, oldPrice = null, category, tags = [], stock = 0, isFeatured = false, luxuryLabel = null, imageUrls = [], hasBadge = false, badgeText = null, badgeBgColor = '#000000', badgeTextColor = '#ffffff', sizeStock = {} }) {
    const ts = now();
    const info = db.prepare(
      `INSERT INTO products (name, description, price, oldPrice, imageUrls, category, tags, stock, isFeatured, luxuryLabel, hasBadge, badgeText, badgeBgColor, badgeTextColor, createdAt, updatedAt, sizeStock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, description, price, oldPrice, JSON.stringify(imageUrls), category, JSON.stringify(tags), stock, isFeatured ? 1 : 0, luxuryLabel, hasBadge ? 1 : 0, badgeText, badgeBgColor, badgeTextColor, ts, ts, JSON.stringify(sizeStock));
    return this.findById(info.lastInsertRowid);
  },

  update(id, fields) {
    const p = this.findById(id);
    if (!p) return null;
    db.prepare(
      `UPDATE products SET name=?, description=?, price=?, oldPrice=?, imageUrls=?, category=?, tags=?, stock=?, isFeatured=?, luxuryLabel=?, hasBadge=?, badgeText=?, badgeBgColor=?, badgeTextColor=?, sizeStock=?, updatedAt=? WHERE id=?`
    ).run(
      fields.name !== undefined ? fields.name : p.name,
      fields.description !== undefined ? fields.description : p.description,
      fields.price !== undefined ? fields.price : p.price,
      fields.oldPrice !== undefined ? fields.oldPrice : p.oldPrice,
      JSON.stringify(fields.imageUrls !== undefined ? fields.imageUrls : p.imageUrls),
      fields.category !== undefined ? fields.category : p.category,
      JSON.stringify(fields.tags !== undefined ? fields.tags : p.tags),
      fields.stock !== undefined ? fields.stock : p.stock,
      (fields.isFeatured !== undefined ? fields.isFeatured : p.isFeatured) ? 1 : 0,
      fields.luxuryLabel !== undefined ? fields.luxuryLabel : p.luxuryLabel,
      (fields.hasBadge !== undefined ? fields.hasBadge : p.hasBadge) ? 1 : 0,
      fields.badgeText !== undefined ? fields.badgeText : p.badgeText,
      fields.badgeBgColor !== undefined ? fields.badgeBgColor : p.badgeBgColor,
      fields.badgeTextColor !== undefined ? fields.badgeTextColor : p.badgeTextColor,
      JSON.stringify(fields.sizeStock !== undefined ? fields.sizeStock : p.sizeStock),
      now(), id
    );
    return this.findById(id);
  },

  decreaseStock(id, size, quantity) {
    const product = this.findById(id);
    if (!product) return null;

    const sizeStock = { ...product.sizeStock };
    if (sizeStock[size] !== undefined) {
      sizeStock[size] = Math.max(0, sizeStock[size] - quantity);
    }

    // Also update total stock
    const newTotalStock = Object.values(sizeStock).reduce((sum, s) => sum + s, 0);

    return this.update(id, { sizeStock, stock: newTotalStock });
  },

  delete(id) {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },
};

module.exports = Product;

