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
    productType: row.productType || null,
    views: row.views || 0,
  };
}

const SORT_COLUMNS = {
  newest: 'createdAt DESC',
  oldest: 'createdAt ASC',
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  views: 'views DESC',
  name: 'name ASC',
};

const Product = {
  async find({ category, productType } = {}, { skip = 0, limit = 20, sort = 'newest' } = {}) {
    const where = [];
    const params = [];
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (productType) {
      where.push('productType = ?');
      params.push(productType);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.newest;
    const [rows] = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );
    return rows.map(format);
  },

  async countDocuments({ category, productType } = {}) {
    const where = [];
    const params = [];
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (productType) {
      where.push('productType = ?');
      params.push(productType);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT COUNT(*) as c FROM products ${whereClause}`, params);
    return rows[0].c;
  },

  async findFeatured(limit = 8) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE isFeatured = 1 ORDER BY createdAt DESC LIMIT ?',
      [limit]
    );
    return rows.map(format);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return format(rows[0] || null);
  },

  async create({ name, description, price, oldPrice = null, category, tags = [], stock = 0, isFeatured = false, luxuryLabel = null, imageUrls = [], hasBadge = false, badgeText = null, badgeBgColor = '#000000', badgeTextColor = '#ffffff', sizeStock = {}, productType = null }) {
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, oldPrice, imageUrls, category, tags, stock, isFeatured, luxuryLabel, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock, productType)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, oldPrice, JSON.stringify(imageUrls), category, JSON.stringify(tags), stock, isFeatured ? 1 : 0, luxuryLabel, hasBadge ? 1 : 0, badgeText, badgeBgColor, badgeTextColor, JSON.stringify(sizeStock), productType]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const p = await this.findById(id);
    if (!p) return null;
    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, oldPrice=?, imageUrls=?, category=?, tags=?, stock=?, isFeatured=?, luxuryLabel=?, hasBadge=?, badgeText=?, badgeBgColor=?, badgeTextColor=?, sizeStock=?, productType=? WHERE id=?`,
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
        fields.productType !== undefined ? fields.productType : p.productType,
        id,
      ]
    );
    return this.findById(id);
  },

  async incrementViews(id) {
    await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
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
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  },
};

module.exports = Product;


