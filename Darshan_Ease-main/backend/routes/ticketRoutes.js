const express = require('express');
const { getTicketByBookingId } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:bookingId', protect, getTicketByBookingId);

module.exports = router;
