const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(protect);

router.get('/', getProfile);
router.put('/', [body('name').optional().trim().notEmpty().isLength({ max: 100 })], updateProfile);
router.post('/upload', upload.single('image'), uploadProfileImage);

module.exports = router;
