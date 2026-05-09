const db = require('../config/db');
const bcrypt = require('bcryptjs');

function format(row, includePassword = false) {
  if (!row) return null;
  const user = {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: row.isAdmin === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (includePassword) user.password = row.password;
  user.matchPassword = async (entered) => bcrypt.compare(entered, row.password);
  return user;
}

const User = {
  findOne({ email }) {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return format(row, true);
  },

  findById(id) {
    const row = db.prepare(
      'SELECT id, name, email, isAdmin, createdAt, updatedAt FROM users WHERE id = ?'
    ).get(id);
    return format(row);
  },

  async create({ name, email, password, isAdmin = false }) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const info = db.prepare(
      'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashed, isAdmin ? 1 : 0);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    return format(row, true);
  },

  deleteAll() {
    db.prepare('DELETE FROM users').run();
  },
};

module.exports = User;

