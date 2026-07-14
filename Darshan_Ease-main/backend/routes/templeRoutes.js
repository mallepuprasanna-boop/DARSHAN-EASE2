const express = require('express');
const {
  getTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple,
} = require('../controllers/templeController');
const { protect, admin, organizer } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getTemples).post(protect, organizer, createTemple);
router
  .route('/:id')
  .get(getTempleById)
  .put(protect, admin, updateTemple)
  .delete(protect, admin, deleteTemple);

module.exports = router;
