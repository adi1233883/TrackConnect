const { pool } = require('../config/db');

const Request = {
  async findBySenderReceiver(senderId, receiverId) {
    const [rows] = await pool.query(
      'SELECT * FROM requests WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiverId]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(senderId, receiverId) {
    const [result] = await pool.query(
      'INSERT INTO requests (sender_id, receiver_id, status) VALUES (?, ?, ?)',
      [senderId, receiverId, 'pending']
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
  },

  async getIncoming(userId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.created_at,
              u.id AS sender_id, u.name AS sender_name, u.email AS sender_email,
              u.phone AS sender_phone, u.profile_image AS sender_image
       FROM requests r
       JOIN users u ON r.sender_id = u.id
       WHERE r.receiver_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async getOutgoing(userId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.created_at,
              u.id AS receiver_id, u.name AS receiver_name, u.email AS receiver_email,
              u.phone AS receiver_phone, u.profile_image AS receiver_image
       FROM requests r
       JOIN users u ON r.receiver_id = u.id
       WHERE r.sender_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async countForUser(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM requests WHERE sender_id = ? OR receiver_id = ?',
      [userId, userId]
    );
    return rows[0].total;
  },
};

module.exports = Request;
