const express = require('express');
const dbRoute = express.Router();

// Simple in-memory variable to store the current user
let currentUser = null;

// POST to set the current user
dbRoute.post('/', async (req, res) => {
  try {
    const { curUsername, role } = req.body;

    if (!curUsername || !role) {
      return res.status(400).json({ success: false, message: 'Missing username or role.' });
    }

    currentUser = {curUsername, role };
    console.log('Current user set:', currentUser);

    res.status(200).json({currentUser });
  } catch (e) {
    console.error('Error setting current user:', e);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET to retrieve the current user
dbRoute.get('/', (req, res) => {
  if (!currentUser) {
    return res.status(404).json({ success: false, message: 'No user is currently logged in.' });
  }

  res.status(200).json({currentUser });
});

module.exports = dbRoute;
