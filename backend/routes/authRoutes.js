const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required.').isLength({ min: 7, max: 20 }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone number is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
