const Location = require('../models/Location');
const Contact = require('../models/Contact');

const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates.' });
    }

    await Location.upsert(req.user.id, lat, lng, accuracy);

    // Broadcast to contacts via socket
    const io = req.app.get('io');
    if (io) {
      const contacts = await Contact.getAll(req.user.id);
      contacts.forEach((c) => {
        io.to(`user_${c.contact_id}`).emit('location_update', {
          userId: req.user.id,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy || null,
          timestamp: new Date().toISOString(),
        });
      });
    }

    res.json({ success: true, message: 'Location updated.' });
  } catch (err) {
    next(err);
  }
};

const getMyLocation = async (req, res, next) => {
  try {
    const location = await Location.getByUserId(req.user.id);
    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

const getContactLocation = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    // Verify they are contacts
    const areContacts = await Contact.exists(req.user.id, targetUserId);
    if (!areContacts) {
      return res.status(403).json({ success: false, message: 'You can only track your approved contacts.' });
    }

    const location = await Location.getByUserId(targetUserId);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not available for this user.' });
    }

    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateLocation, getMyLocation, getContactLocation };
