const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const otpGenerator = require("otp-generator");

const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const sendOTP = require("../utils/mailer");

// Temporary OTP storage (use Redis/DB in production)
const otpStore = {};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, phone, password } = req.body;

    const existingEmail = await User.findByEmail(email);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const existingPhone = await User.findByPhone(phone);

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userId = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(userId);

    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      token,
      user,
      message: "Account created successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { identifier, password } = req.body;

    let user = await User.findByEmail(identifier);

    if (!user) {
      user = await User.findByPhone(identifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    otpStore[user.email] = otp;

    await sendOTP(user.email, otp);

    res.json({
      success: true,
      otpSent: true,
      email: user.email,
      message: "OTP sent to your email.",
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (otpStore[email] !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    delete otpStore[email];

    const user = await User.findByEmail(email);

    await User.setOnline(user.id, true);

    const token = generateToken(user.id);

    const { password, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser,
      message: "Login successful.",
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.setOnline(req.user.id, false);

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  getMe,
  logout,
};

