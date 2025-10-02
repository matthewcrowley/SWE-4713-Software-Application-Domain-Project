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
  const {email, username} = q.body;

  if (!email) {
    return r.status(400).json({success: false, message: "The email is missing."});
  }

  try {
    await transport.sendMail({
      from: '"SweetLedger Admin" <matthewcrowley2002@gmail.com>',
      to: email,
      subject: 'Your Boss Needs You',
      text: `Hi ${username}, your admin has pinged you.`
    });

    r.json({success: true});
  } catch (error) {
    console.error("Error sending Email:", error);
    r.status(500).json({success: false, message: "Email failed to send."});
  }
});

module.exports = dbRoute;