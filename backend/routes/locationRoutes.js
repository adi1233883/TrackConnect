const express = require('express');
const { updateLocation, getMyLocation, getContactLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/update', updateLocation);
router.get('/my', getMyLocation);
router.get('/:userId', getContactLocation);

module.exports = router;
