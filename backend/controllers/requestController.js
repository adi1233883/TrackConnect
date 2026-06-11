const Request = require('../models/Request');
const Contact = require('../models/Contact');

const getIncoming = async (req, res, next) => {
  try {
    const requests = await Request.getIncoming(req.user.id);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

const getOutgoing = async (req, res, next) => {
  try {
    const requests = await Request.getOutgoing(req.user.id);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is no longer pending.' });
    }

    await Request.updateStatus(requestId, 'accepted');
    await Contact.create(request.sender_id, request.receiver_id);

    res.json({ success: true, message: 'Request accepted. Contact added.' });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.sender_id}`).emit('request_accepted', {
        requestId,
        by: { id: req.user.id, name: req.user.name },
      });
    }
  } catch (err) {
    next(err);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is no longer pending.' });
    }

    await Request.updateStatus(requestId, 'rejected');
    res.json({ success: true, message: 'Request rejected.' });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.sender_id}`).emit('request_rejected', {
        requestId,
        by: { id: req.user.id, name: req.user.name },
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getIncoming, getOutgoing, acceptRequest, rejectRequest };
