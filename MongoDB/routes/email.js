const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'apikey',
    pass: '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'
  }
});

router.post('/', async (req, res) => {
  const { email, username } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Missing email." });
  }

  try {
    await transporter.sendMail({
      from: '"SweetLedger Admin" <matthewcrowley2002@gmail.com>',
      to: email,
      subject: 'Your Boss Needs You',
      text: `Hi ${username}, your admin has pinged you.`
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

module.exports = router;
