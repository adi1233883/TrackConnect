const { pool } = require('../config/db');

const Location = {
  async upsert(userId, latitude, longitude, accuracy) {
    await pool.query(
      `INSERT INTO locations (user_id, latitude, longitude, accuracy)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude),
       accuracy = VALUES(accuracy), updated_at = NOW()`,
      [userId, latitude, longitude, accuracy || null]
    );
  },

  async getByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM locations WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = Location;
