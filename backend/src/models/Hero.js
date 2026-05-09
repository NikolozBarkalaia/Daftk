const db = require('../config/db');

function now() { return new Date().toISOString(); }

function withMedia(row) {
  if (!row) return null;
  const mediaRow = row.mediaId
    ? db.prepare('SELECT * FROM media WHERE id = ?').get(row.mediaId)
    : null;
  return {
    ...row,
    _id: row.id,
    isActive: row.isActive === 1,
    mediaId: mediaRow ? { ...mediaRow, _id: mediaRow.id } : row.mediaId,
  };
}

const Hero = {
  findActive() {
    return withMedia(db.prepare('SELECT * FROM hero WHERE isActive = 1 LIMIT 1').get());
  },

  create({ title, subtitle, buttonText, buttonLink, mediaType, mediaId = null, isActive = true }) {
    const ts = now();
    const info = db.prepare(
      `INSERT INTO hero (title, subtitle, buttonText, buttonLink, mediaType, mediaId, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, subtitle, buttonText, buttonLink, mediaType, mediaId, isActive ? 1 : 0, ts, ts);
    return withMedia(db.prepare('SELECT * FROM hero WHERE id = ?').get(info.lastInsertRowid));
  },

  update(id, { title, subtitle, buttonText, buttonLink, mediaType, mediaId }) {
    db.prepare(
      `UPDATE hero SET title=?, subtitle=?, buttonText=?, buttonLink=?, mediaType=?, mediaId=?, updatedAt=? WHERE id=?`
    ).run(title, subtitle, buttonText, buttonLink, mediaType, mediaId, now(), id);
    return withMedia(db.prepare('SELECT * FROM hero WHERE id = ?').get(id));
  },
};

module.exports = Hero;

