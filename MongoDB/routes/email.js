require('dotenv').config();
const express = require('express');
const dbRoute = express.Router();
const sgMail = require('@sendgrid/mail');
const { logSystemError } = require('../utils/errorLogger');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

dbRoute.post('/', async (req, res) => {
  const { email, username, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await sgMail.send({
      to: email,
      from: 'matthewcrowley2002@gmail.com',
      subject,
      text: `Hi ${username || ''},\n\n${message}`,
    });

    res.json({ success: true });
  } catch (error) {
    await logSystemError(error);
    console.error("There was an error sending the email:", error.response ? error.response.body : error);
    res.status(500).json({ success: false, message: "The email failed to send." });
  }
});

module.exports = dbRoute;