const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticate = require('../middlewares/authenticate');

// Get all division heads (for coordinator use)
router.get('/division-heads', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') return res.status(403).json({ message: 'Access denied' });

    const divisionHeads = await User.find({ role: 'divisionHead' }, 'name _id email');
    res.json(divisionHeads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to get all Assignees
router.get('/assignees', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'divisionHead') return res.status(403).json({ message: 'Access denied' });

    const assignees = await User.find({ role: 'assignee' }, 'name _id email');
    res.json(assignees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
