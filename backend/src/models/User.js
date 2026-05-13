const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

function format(row, includePassword = false) {
  if (!row) return null;
  const user = {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: Boolean(row.isAdmin),
    emailVerified: Boolean(row.emailVerified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (includePassword) user.password = row.password;
  user.matchPassword = async (entered) => bcrypt.compare(entered, row.password);
  return user;
}

const User = {
  async findOne({ email }) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return format(rows[0] || null, true);
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, isAdmin, emailVerified, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    );
    return format(rows[0] || null);
  },

  async create({ name, email, password, isAdmin = false }) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
      [name, email, hashed, isAdmin ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return format(rows[0], true);
  },

  async deleteAll() {
    await pool.query('DELETE FROM users');
  },

  async markVerified(email) {
    await pool.query(
      'UPDATE users SET emailVerified = 1 WHERE email = ?',
      [email]
    );
  },
};

module.exports = User;

