const { pool } = require('../config/db');

async function withMedia(row) {
  if (!row) return null;
  const [rows] = await pool.execute('SELECT * FROM media WHERE id = ?', [row.mediaId]);
  const mediaRow = rows[0] || null;
  return {
    ...row,
    _id: row.id,
    order: row.displayOrder,
    isActive: Boolean(row.isActive),
    mediaId: mediaRow ? { ...mediaRow, _id: mediaRow.id } : row.mediaId,
  };
}

const SliderItem = {
  async findAll({ isActive = true } = {}) {
    const [rows] = await pool.execute(
      'SELECT * FROM slider_items WHERE isActive = ? ORDER BY displayOrder ASC',
      [isActive ? 1 : 0]
    );
    return Promise.all(rows.map(withMedia));
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM slider_items WHERE id = ?', [id]);
    return withMedia(rows[0] || null);
  },

  async findMaxOrder() {
    const [rows] = await pool.execute('SELECT MAX(displayOrder) as maxOrder FROM slider_items');
    const val = rows[0].maxOrder;
    return val !== null ? val : -1;
  },

  async create({ title, subtitle, mediaType, mediaId, order, isActive = true }) {
    const [result] = await pool.execute(
      'INSERT INTO slider_items (title, subtitle, mediaType, mediaId, displayOrder, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle, mediaType, mediaId, order, isActive ? 1 : 0]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const [rows] = await pool.execute('SELECT * FROM slider_items WHERE id = ?', [id]);
    const item = rows[0];
    if (!item) return null;
    await pool.execute(
      'UPDATE slider_items SET title=?, subtitle=?, mediaType=?, mediaId=?, displayOrder=? WHERE id=?',
      [
        fields.title !== undefined ? fields.title : item.title,
        fields.subtitle !== undefined ? fields.subtitle : item.subtitle,
        fields.mediaType !== undefined ? fields.mediaType : item.mediaType,
        fields.mediaId !== undefined ? fields.mediaId : item.mediaId,
        fields.order !== undefined ? fields.order : item.displayOrder,
        id,
      ]
    );
    return this.findById(id);
  },

  async updateOrder(id, order) {
    await pool.execute('UPDATE slider_items SET displayOrder=? WHERE id=?', [order, id]);
  },

  async delete(id) {
    await pool.execute('DELETE FROM slider_items WHERE id = ?', [id]);
  },
};

module.exports = SliderItem;

