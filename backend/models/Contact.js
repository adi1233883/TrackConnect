const { pool } = require('../config/db');

const Contact = {
  async exists(userId, contactId) {
    const [rows] = await pool.query(
      'SELECT id FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)',
      [userId, contactId, contactId, userId]
    );
    return rows.length > 0;
  },

  async create(userId, contactId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)', [userId, contactId]);
      await conn.query('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)', [contactId, userId]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getAll(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.created_at,
              u.id AS contact_id, u.name, u.email, u.phone,
              u.profile_image, u.is_online, u.last_seen
       FROM contacts c
       JOIN users u ON c.contact_id = u.id
       WHERE c.user_id = ?
       ORDER BY u.name ASC`,
      [userId]
    );
    return rows;
  },

  async delete(userId, contactId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'DELETE FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)',
        [userId, contactId, contactId, userId]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async countForUser(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM contacts WHERE user_id = ?',
      [userId]
    );
    return rows[0].total;
  },
};

module.exports = Contact;
