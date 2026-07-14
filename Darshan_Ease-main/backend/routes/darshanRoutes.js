const express = require('express');
const {
  getSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
} = require('../controllers/darshanController');
const { protect, organizer } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getSlots).post(protect, organizer, createSlot);
router
  .route('/:id')
  .get(getSlotById)
  .put(protect, organizer, updateSlot)
  .delete(protect, organizer, deleteSlot);

module.exports = router;

