const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create({ name, email, phone, password: hashedPassword });
    const token = generateToken(userId);
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // identifier = email or phone
    let user = await User.findByEmail(identifier);
    if (!user) {
      user = await User.findByPhone(identifier);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    await User.setOnline(user.id, true);
    const token = generateToken(user.id);

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.setOnline(req.user.id, false);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout };
