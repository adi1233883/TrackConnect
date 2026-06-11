const { validationResult } = require('express-validator');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Request = require('../models/Request');
const path = require('path');
const fs = require('fs');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const totalContacts = await Contact.countForUser(req.user.id);
    const totalRequests = await Request.countForUser(req.user.id);

    res.json({
      success: true,
      profile: { ...user, totalContacts, totalRequests },
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    await User.update(req.user.id, updates);
    const updatedUser = await User.findById(req.user.id);

    res.json({ success: true, message: 'Profile updated.', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Delete old profile image if it exists
    const currentUser = await User.findById(req.user.id);
    if (currentUser.profile_image) {
      const oldImagePath = path.join(__dirname, '..', currentUser.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    await User.update(req.user.id, { profile_image: imageUrl });

    res.json({ success: true, message: 'Profile image updated.', imageUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
