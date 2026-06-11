const express = require('express');
const { getContacts, sendRequest, deleteContact } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getContacts);
router.post('/request', sendRequest);
router.delete('/:id', deleteContact);

module.exports = router;
