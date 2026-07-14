const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;
