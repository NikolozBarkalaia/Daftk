const { pool } = require('../config/db');

function format(row) {
  if (!row) return null;
  return { ...row, _id: row.id };
}

const ProductType = {
  async find() {
    const [rows] = await pool.query(
      'SELECT * FROM product_types ORDER BY displayOrder ASC, name ASC'
    );
    return rows.map(format);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM product_types WHERE id = ?', [id]);
    return format(rows[0] || null);
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM product_types WHERE name = ?', [name]);
    return format(rows[0] || null);
  },

  async create({ name, displayOrder = 0 }) {
    const [result] = await pool.query(
      'INSERT INTO product_types (name, displayOrder) VALUES (?, ?)',
      [name, displayOrder]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const t = await this.findById(id);
    if (!t) return null;
    await pool.query(
      'UPDATE product_types SET name = ?, displayOrder = ? WHERE id = ?',
      [
        fields.name !== undefined ? fields.name : t.name,
        fields.displayOrder !== undefined ? fields.displayOrder : t.displayOrder,
        id,
      ]
    );
    return this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM product_types WHERE id = ?', [id]);
  },
};

module.exports = ProductType;
