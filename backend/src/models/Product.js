const { pool } = require('../config/db');

function format(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    imageUrls: typeof row.imageUrls === 'string' ? JSON.parse(row.imageUrls || '[]') : (row.imageUrls || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
    isFeatured: Boolean(row.isFeatured),
    hasBadge: Boolean(row.hasBadge),
    badgeText: row.badgeText || null,
    badgeBgColor: row.badgeBgColor || '#000000',
    badgeTextColor: row.badgeTextColor || '#ffffff',
    sizeStock: typeof row.sizeStock === 'string' ? JSON.parse(row.sizeStock || '{}') : (row.sizeStock || {}),
  };
}

const Product = {
  async find({ category } = {}, { skip = 0, limit = 20 } = {}) {
    let rows;
    if (category) {
      [rows] = await pool.execute(
        'SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [category, limit, skip]
      );
    } else {
      [rows] = await pool.execute(
        'SELECT * FROM products ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [limit, skip]
      );
    }
    return rows.map(format);
  },

  async countDocuments({ category } = {}) {
    let rows;
    if (category) {
      [rows] = await pool.execute('SELECT COUNT(*) as c FROM products WHERE category = ?', [category]);
    } else {
      [rows] = await pool.execute('SELECT COUNT(*) as c FROM products');
    }
    return rows[0].c;
  },

  async findFeatured(limit = 8) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE isFeatured = 1 ORDER BY createdAt DESC LIMIT ?',
      [limit]
    );
    return rows.map(format);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return format(rows[0] || null);
  },

  async create({ name, description, price, oldPrice = null, category, tags = [], stock = 0, isFeatured = false, luxuryLabel = null, imageUrls = [], hasBadge = false, badgeText = null, badgeBgColor = '#000000', badgeTextColor = '#ffffff', sizeStock = {} }) {
    const [result] = await pool.execute(
      `INSERT INTO products (name, description, price, oldPrice, imageUrls, category, tags, stock, isFeatured, luxuryLabel, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, oldPrice, JSON.stringify(imageUrls), category, JSON.stringify(tags), stock, isFeatured ? 1 : 0, luxuryLabel, hasBadge ? 1 : 0, badgeText, badgeBgColor, badgeTextColor, JSON.stringify(sizeStock)]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const p = await this.findById(id);
    if (!p) return null;
    await pool.execute(
      `UPDATE products SET name=?, description=?, price=?, oldPrice=?, imageUrls=?, category=?, tags=?, stock=?, isFeatured=?, luxuryLabel=?, hasBadge=?, badgeText=?, badgeBgColor=?, badgeTextColor=?, sizeStock=? WHERE id=?`,
      [
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
        id,
      ]
    );
    return this.findById(id);
  },

  async decreaseStock(id, size, quantity) {
    const product = await this.findById(id);
    if (!product) return null;

    const sizeStock = { ...product.sizeStock };
    if (sizeStock[size] !== undefined) {
      sizeStock[size] = Math.max(0, sizeStock[size] - quantity);
    }

    const newTotalStock = Object.values(sizeStock).reduce((sum, s) => sum + s, 0);
    return this.update(id, { sizeStock, stock: newTotalStock });
  },

  async delete(id) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  },
};

module.exports = Product;


