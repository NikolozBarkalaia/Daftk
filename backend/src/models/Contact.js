const db = require('../config/db');

const Contact = {
  create({ name, email, message }) {
    const info = db.prepare(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)'
    ).run(name, email, message);
    return db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(info.lastInsertRowid);
  },

  findAll() {
    return db.prepare('SELECT * FROM contact_messages ORDER BY createdAt DESC').all();
  }
};

module.exports = Contact;
