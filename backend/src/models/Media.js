const db = require('../config/db');

function now() { return new Date().toISOString(); }

function format(row) {
  if (!row) return null;
  return { ...row, _id: row.id };
}

const Media = {
  find({ skip = 0, limit = 20 } = {}) {
    return db.prepare(
      'SELECT * FROM media ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    ).all(limit, skip).map(format);
  },

  countDocuments() {
    return db.prepare('SELECT COUNT(*) as c FROM media').get().c;
  },

  findById(id) {
    return format(db.prepare('SELECT * FROM media WHERE id = ?').get(id));
  },

  create({ filename, url, type, size }) {
    const ts = now();
    const info = db.prepare(
      'INSERT INTO media (filename, url, type, size, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(filename, url, type, size, ts, ts);
    return this.findById(info.lastInsertRowid);
  },

  delete(id) {
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
  },
};

module.exports = Media;

