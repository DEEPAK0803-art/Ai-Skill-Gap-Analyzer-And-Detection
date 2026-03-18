const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get chat history
router.get('/chat-history', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user.userId });
        res.json(chat ? chat.messages : []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save chat message
router.post('/save-chat', auth, async (req, res) => {
    try {
        const { messages } = req.body;
        let chat = await Chat.findOne({ userId: req.user.userId });
        if (chat) {
            chat.messages = messages;
            chat.updatedAt = Date.now();
        } else {
            chat = new Chat({ userId: req.user.userId, messages });
        }
        await chat.save();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
