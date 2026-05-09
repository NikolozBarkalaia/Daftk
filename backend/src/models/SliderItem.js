const db = require('../config/db');

function now() { return new Date().toISOString(); }

function withMedia(row) {
  if (!row) return null;
  const mediaRow = db.prepare('SELECT * FROM media WHERE id = ?').get(row.mediaId);
  return {
    ...row,
    _id: row.id,
    order: row.displayOrder,
    isActive: row.isActive === 1,
    mediaId: mediaRow ? { ...mediaRow, _id: mediaRow.id } : row.mediaId,
  };
}

const SliderItem = {
  findAll({ isActive = true } = {}) {
    return db.prepare(
      'SELECT * FROM slider_items WHERE isActive = ? ORDER BY displayOrder ASC'
    ).all(isActive ? 1 : 0).map(withMedia);
  },

  findById(id) {
    return withMedia(db.prepare('SELECT * FROM slider_items WHERE id = ?').get(id));
  },

  findMaxOrder() {
    const row = db.prepare('SELECT MAX(displayOrder) as maxOrder FROM slider_items').get();
    return row.maxOrder !== null ? row.maxOrder : -1;
  },

  create({ title, subtitle, description, buttonText = 'Discover', buttonLink, mediaType, mediaId, order, isActive = true }) {
    const ts = now();
    const info = db.prepare(
      `INSERT INTO slider_items (title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, displayOrder, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, order, isActive ? 1 : 0, ts, ts);
    return this.findById(info.lastInsertRowid);
  },

  update(id, fields) {
    const item = db.prepare('SELECT * FROM slider_items WHERE id = ?').get(id);
    if (!item) return null;
    db.prepare(
      `UPDATE slider_items SET title=?, subtitle=?, description=?, buttonText=?, buttonLink=?, mediaType=?, mediaId=?, displayOrder=?, updatedAt=? WHERE id=?`
    ).run(
      fields.title !== undefined ? fields.title : item.title,
      fields.subtitle !== undefined ? fields.subtitle : item.subtitle,
      fields.description !== undefined ? fields.description : item.description,
      fields.buttonText !== undefined ? fields.buttonText : item.buttonText,
      fields.buttonLink !== undefined ? fields.buttonLink : item.buttonLink,
      fields.mediaType !== undefined ? fields.mediaType : item.mediaType,
      fields.mediaId !== undefined ? fields.mediaId : item.mediaId,
      fields.order !== undefined ? fields.order : item.displayOrder,
      now(), id
    );
    return this.findById(id);
  },

  updateOrder(id, order) {
    db.prepare('UPDATE slider_items SET displayOrder=?, updatedAt=? WHERE id=?').run(order, now(), id);
  },

  delete(id) {
    db.prepare('DELETE FROM slider_items WHERE id = ?').run(id);
  },
};

module.exports = SliderItem;

