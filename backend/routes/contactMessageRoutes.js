const express = require('express');
const {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  getPendingContactCount,
  replyToContactMessage,
} = require('../controllers/contactMessageController');

const { protect, authorize } = require('../authmiddelware/authMiddleware');

const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

/**
 * PUBLIC
 * Anyone (logged in or not) can submit Contact Us form
 */
router.post('/contact', createContactMessage);

/**
 * ADMIN ONLY
 * View, update, delete contact messages
 */
router.get('/contact', protect, authorize('admin'), getAllContactMessages);

router.get(
  '/contact/pending-count',
  protect,
  authorize('admin'),
  getPendingContactCount
);

router.get('/contact/:id', protect, authorize('admin'), getContactMessageById);

router.put(
  '/contact/:id',
  protect,
  authorize('admin'),
  updateContactMessageStatus
);

router.put(
  '/contact/:id/seen',
  protect,
  authorize('admin'),
  async (req, res) => {
    await ContactMessage.findByIdAndUpdate(req.params.id, {
      status: 'Seen',
    });

    res.json({ message: 'Message marked as seen' });
  }
);

router.put(
  '/contact/:id/reply',
  protect,
  authorize('admin'),
  replyToContactMessage
);

router.delete(
  '/contact/:id',
  protect,
  authorize('admin'),
  deleteContactMessage
);

module.exports = router;
