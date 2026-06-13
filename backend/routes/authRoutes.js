
const express = require("express");

const {
  register,
  login,
  verifyOTP,
  getMe,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Register new user
router.post("/register", register);

// Login with email/phone + password
// Sends OTP to user's email
router.post("/login", login);

// Verify OTP and complete login
router.post("/verify-otp", verifyOTP);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

// Get logged-in user
router.get("/me", protect, getMe);

// Logout user
router.post("/logout", protect, logout);

module.exports = router;

