const { pool } = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByPhone(phone) {
    const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, is_online, last_seen, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, phone, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone, password]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
  },

  async setOnline(id, isOnline) {
    await pool.query('UPDATE users SET is_online = ?, last_seen = NOW() WHERE id = ?', [isOnline ? 1 : 0, id]);
  },
};

module.exports = User;
