const Contact = require('../models/Contact');
const Request = require('../models/Request');
const User = require('../models/User');

const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.getAll(req.user.id);
    res.json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
};

const sendRequest = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Find the target user by phone
    const target = await User.findByPhone(phone);
    if (!target) {
      return res.status(404).json({ success: false, message: 'No user found with that phone number.' });
    }

    if (target.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot send a request to yourself.' });
    }

    // Check if already contacts
    const alreadyContact = await Contact.exists(req.user.id, target.id);
    if (alreadyContact) {
      return res.status(409).json({ success: false, message: 'This user is already in your contacts.' });
    }

    // Check if request already exists (in either direction)
    const existingOutgoing = await Request.findBySenderReceiver(req.user.id, target.id);
    if (existingOutgoing) {
      return res.status(409).json({ success: false, message: 'You already sent a request to this user.' });
    }

    const existingIncoming = await Request.findBySenderReceiver(target.id, req.user.id);
    if (existingIncoming) {
      return res.status(409).json({ success: false, message: 'This user already sent you a request. Check incoming requests.' });
    }

    const requestId = await Request.create(req.user.id, target.id);

    res.status(201).json({
      success: true,
      message: `Tracking request sent to ${target.name}.`,
      requestId,
      target: { id: target.id, name: target.name, phone: target.phone },
    });

    // Emit socket event (accessed via req.app.get('io'))
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${target.id}`).emit('new_request', {
        requestId,
        from: { id: req.user.id, name: req.user.name, phone: req.user.phone },
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    if (!contactId) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID.' });
    }

    const exists = await Contact.exists(req.user.id, contactId);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    await Contact.delete(req.user.id, contactId);
    res.json({ success: true, message: 'Contact removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContacts, sendRequest, deleteContact };
