const db = require('../config/db');

function now() { return new Date().toISOString(); }

function format(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    tags: JSON.parse(row.tags || '[]'),
  };
}

const Post = {
  find({ skip = 0, limit = 10 } = {}) {
    return db.prepare(
      'SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    ).all(limit, skip).map(format);
  },

  countDocuments() {
    return db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
  },

  findById(id) {
    return format(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
  },

  create({ title, content, image = '', tags = [] }) {
    const ts = now();
    const info = db.prepare(
      'INSERT INTO posts (title, content, image, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, content, image, JSON.stringify(tags), ts, ts);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { title, content, image, tags }) {
    const p = this.findById(id);
    if (!p) return null;
    db.prepare(
      'UPDATE posts SET title=?, content=?, image=?, tags=?, updatedAt=? WHERE id=?'
    ).run(
      title || p.title,
      content || p.content,
      image !== undefined ? image : p.image,
      JSON.stringify(tags || p.tags),
      now(), id
    );
    return this.findById(id);
  },

  delete(id) {
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  },
};

module.exports = Post;

