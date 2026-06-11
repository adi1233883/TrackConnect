const express = require('express');
const { getIncoming, getOutgoing, acceptRequest, rejectRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/incoming', getIncoming);
router.get('/outgoing', getOutgoing);
router.post('/accept/:id', acceptRequest);
router.post('/reject/:id', rejectRequest);

module.exports = router;
