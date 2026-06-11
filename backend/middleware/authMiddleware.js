const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    next(err);
  }
};

module.exports = { protect };
