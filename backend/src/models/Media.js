const { pool } = require('../config/db');

function format(row) {
  if (!row) return null;
  return { ...row, _id: row.id };
}

const Media = {
  async find({ skip = 0, limit = 20 } = {}) {
    const [rows] = await pool.query(
      'SELECT * FROM media ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, skip]
    );
    return rows.map(format);
  },

  async countDocuments() {
    const [rows] = await pool.query('SELECT COUNT(*) as c FROM media');
    return rows[0].c;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM media WHERE id = ?', [id]);
    return format(rows[0] || null);
  },

  async create({ filename, url, type, size }) {
    const [result] = await pool.query(
      'INSERT INTO media (filename, url, type, size) VALUES (?, ?, ?, ?)',
      [filename, url, type, size]
    );
    return this.findById(result.insertId);
  },

  async delete(id) {
    await pool.query('DELETE FROM media WHERE id = ?', [id]);
  },
};

module.exports = Media;

