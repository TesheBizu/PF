const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getMessage,
  deleteMessage,
  markAsRead,
  seedMessages,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Public — anyone can send a message
router.post('/', sendMessage);

// Private (Admin)
router.get('/',            protect, getMessages);
router.get('/:id',         protect, getMessage);
router.patch('/:id/read',  protect, markAsRead);
router.delete('/:id',      protect, deleteMessage);
router.post('/seed',       protect, seedMessages);

module.exports = router;
