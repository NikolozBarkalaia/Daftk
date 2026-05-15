const { pool } = require('../config/db');

const Settings = {
  async getAll() {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  },

  async upsert(settingsObj) {
    const keys = Object.keys(settingsObj);
    if (keys.length === 0) return;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const key of keys) {
        await connection.query(
          'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [key, settingsObj[key], settingsObj[key]]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Settings;
