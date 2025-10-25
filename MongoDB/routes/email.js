const express = require('express');
const dbRoute = express.Router();
const mailer = require('nodemailer');

const transport = mailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'apikey',
    pass: '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'
  }
});

dbRoute.post('/', async (q, r) => {
  const { email, username, subject, message } = q.body;

  if (!email || !subject || !message) {
    return r.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transport.sendMail({
    from: '"SweetLedger Admin" <matthewcrowley2002@gmail.com>',
    to: email,
    subject,
    text: `Hi ${username},\n\n${message}`,
  });

    r.json({success: true});
  } catch (error) {
    console.error("Error sending Email:", error);
    r.status(500).json({success: false, message: "Email failed to send."});
  }
});

module.exports = dbRoute;