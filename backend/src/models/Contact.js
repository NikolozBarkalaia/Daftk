const { pool } = require('../config/db');

const Contact = {
  async create({ name, email, message }) {
    const [result] = await pool.execute(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    const [rows] = await pool.execute('SELECT * FROM contact_messages WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY createdAt DESC');
    return rows;
  },
};

module.exports = Contact;
