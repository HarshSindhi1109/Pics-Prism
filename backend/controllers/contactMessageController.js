const ContactMessage = require('../models/ContactMessage');
const { sendContactReplyEmail } = require('../utils/sendEmail');

/**
 * ✅ Create Contact Message
 * PUBLIC
 */
const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();

    return res.status(201).json({
      message: 'Your message has been sent successfully',
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get All Contact Messages
 * ADMIN
 */
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get Contact Message By ID
 * ADMIN
 */
const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Contact message not found',
      });
    }

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update Contact Message Status
 * ADMIN
 */
const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Seen', 'Replied'].includes(status)) {
      return res.status(400).json({
        message: 'Only Seen or Replied status allowed',
      });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Contact message not found',
      });
    }

    if (message.status === 'Pending') {
      return res.status(400).json({
        message: 'Pending messages must be opened before updating status',
      });
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      message: 'Contact message status updated',
      data: message,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get Pending Contact Messages Count
 * ADMIN
 */
const getPendingContactCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({
      status: 'Pending',
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyToContactMessage = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply is required' });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await sendContactReplyEmail(message.email, message.subject, reply);

    message.status = 'Replied';
    await message.save();

    res.status(200).json({
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Delete Contact Message
 * ADMIN
 */
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Contact message not found',
      });
    }

    return res.status(200).json({
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  getPendingContactCount,
  replyToContactMessage,
};
