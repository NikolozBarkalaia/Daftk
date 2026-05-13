const { pool } = require('../config/db');

async function withMedia(row) {
  if (!row) return null;
  let mediaRow = null;
  if (row.mediaId) {
    const [rows] = await pool.execute('SELECT * FROM media WHERE id = ?', [row.mediaId]);
    mediaRow = rows[0] || null;
  }
  return {
    ...row,
    _id: row.id,
    isActive: Boolean(row.isActive),
    mediaId: mediaRow ? { ...mediaRow, _id: mediaRow.id } : row.mediaId,
  };
}

const Hero = {
  async findActive() {
    const [rows] = await pool.execute('SELECT * FROM hero WHERE isActive = 1 LIMIT 1');
    return withMedia(rows[0] || null);
  },

  async create({ title, subtitle, buttonText, buttonLink, mediaType, mediaId = null, isActive = true }) {
    const [result] = await pool.execute(
      'INSERT INTO hero (title, subtitle, buttonText, buttonLink, mediaType, mediaId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, buttonText, buttonLink, mediaType, mediaId, isActive ? 1 : 0]
    );
    const [rows] = await pool.execute('SELECT * FROM hero WHERE id = ?', [result.insertId]);
    return withMedia(rows[0]);
  },

  async update(id, { title, subtitle, buttonText, buttonLink, mediaType, mediaId }) {
    await pool.execute(
      'UPDATE hero SET title=?, subtitle=?, buttonText=?, buttonLink=?, mediaType=?, mediaId=? WHERE id=?',
      [title, subtitle, buttonText, buttonLink, mediaType, mediaId, id]
    );
    const [rows] = await pool.execute('SELECT * FROM hero WHERE id = ?', [id]);
    return withMedia(rows[0]);
  },
};

module.exports = Hero;

