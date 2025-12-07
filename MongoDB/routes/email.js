require('dotenv').config();
const express = require('express');
const dbRoute = express.Router();
const mailer = require('nodemailer');
const {logSystemError} = require('../utils/errorLogger');

const transport = mailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

dbRoute.post('/', async (req, res) => {
  const { email, username, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transport.sendMail({
      from: '"SweetLedger Admin" <matthewcrowley2002@gmail.com>',
      to: email,
      subject,
      text: `Hi,\n\n${message}`,
    });

    res.json({ success: true });
  } catch (error) {
    await logSystemError(error);
    console.error("There was an error sending the Email:", error);
    res.status(500).json({ success: false, message: "The Email failed to send." });
  }
});

module.exports = dbRoute;
