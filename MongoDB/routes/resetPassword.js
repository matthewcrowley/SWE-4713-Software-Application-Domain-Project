const express = require("express");
const router = express.Router();
const {logSystemError} = require('../utils/errorLogger');

router.post("/verify-user", async (req, res) => {
  const { username, email } = req.body;
  const db = req.app.locals.db;

  try {
    const user = await db.collection("users").findOne({username, email});
    if (!user) return res.json({success: false, message: "The user was not found."});
    return res.json({success: true});
  } catch (err) {
    await logSystemError(err);
    console.error(err);
    return res.json({success: false, message: "There was a server error."});
  }
});

router.post("/verify-security", async (req, res) => {
  const { username, a1, a2, a3 } = req.body;
  const db = req.app.locals.db;

  try {
    const user = await db.collection("users").findOne({username});
    if (!user) return res.json({success: false, message: "The user was not found."});

    if (
      user.secQuestion1 !== a1 ||
      user.secQuestion2 !== a2 ||
      user.secQuestion3 !== a3
    ) {
      return res.json({success: false, message: "The answers that were inputted are incorrect."});
    }

    return res.json({success: true});
  } catch (err) {
    await logSystemError(err);
    console.error(err);
    return res.json({success: false, message: "There was a server error."});
  }
});

router.post("/reset-password", async (req, res) => {
  const { username, passwordHash } = req.body;
  const db = req.app.locals.db;

  try {
    const user = await db.collection("users").findOne({username});
    if (!user) {
      return res.status(404).json({success: false, message: "The user was not found."});
    }

    if (user.passwordHash === passwordHash) {
      return res.status(400).json({success: false, message: 'Your new password cannot be the same as your current password.'});
    }

    const result = await db
      .collection("users")
      .updateOne({username}, {$set: {passwordHash, passwordUpdatedAt: new Date()}});

    if (result.modifiedCount === 0) {
      return res.json({success: false, message: "Your password was not updated."});
    }

    return res.json({success: true, message: "Your password was updated successfully."});
  } catch (err) {
    await logSystemError(err);
    console.error(err);
    return res.status(500).json({success: false, message: "There was a server error."});
  }
});

module.exports = router;    