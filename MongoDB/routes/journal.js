const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|csv|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, CSV, and image files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// GET all journal entries
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const journalEntries = await db.collection('journal')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(journalEntries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// GET single journal entry by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    const journalEntry = await db.collection('journal')
      .findOne({ _id: new ObjectId(id) });
    
    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.status(200).json(journalEntry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// POST create new journal entry with file uploads
router.post('/', upload.array('attachments', 10), async (req, res) => {
  try {
    const db = getDB();
    const { date, description, createdBy, status, isAdjustingEntry } = req.body;
    const entries = JSON.parse(req.body.entries); // Parse the JSON string

    // Validation
    if (!date || !description || !entries || entries.length < 2) {
      return res.status(400).json({ 
        error: 'Date, description, and at least 2 entries are required' 
      });
    }

    // Calculate totals
    const debitTotal = entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
    const creditTotal = entries.reduce((sum, e) => sum + parseFloat(e.credit || 0), 0);

    // Check if balanced
    if (Math.abs(debitTotal - creditTotal) > 0.01) {
      return res.status(400).json({ 
        error: 'Journal entry must be balanced (debits must equal credits)' 
      });
    }

    // Get the last journal entry number
    const lastEntry = await db.collection('journal')
      .find()
      .sort({ journalEntryNumber: -1 })
      .limit(1)
      .toArray();
    
    const journalEntryNumber = lastEntry.length > 0 
      ? (lastEntry[0].journalEntryNumber || 0) + 1 
      : 1;

    // Get filenames of uploaded files
    const attachments = req.files ? req.files.map(file => file.filename) : [];

    const newJournalEntry = {
      journalEntryNumber,
      date: new Date(date),
      description,
      entries: entries.map(e => ({
        accountId: e.accountId,
        accountName: e.accountName,
        debit: parseFloat(e.debit || 0),
        credit: parseFloat(e.credit || 0)
      })),
      status: status || 'pending',
      isAdjustingEntry: isAdjustingEntry === 'true',
      attachments: attachments, // Store filenames
      createdBy: createdBy, 
      createdAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      comment: ''
    };

    const result = await db.collection('journal').insertOne(newJournalEntry);
    
    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || createdBy || 'Unknown',
      action: 'CREATE',
      targetType: 'journalEntry',
      targetId: result.insertedId.toString(),
      details: `Created journal entry: ${description}`,
      timestamp: new Date()
    });

    res.status(201).json({ 
      message: 'Journal entry created successfully',
      journalEntryId: result.insertedId,
      journalEntryNumber,
      attachments
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry: ' + error.message });
  }
});

// PUT approve journal entry - IMPROVED WITH RUNNING BALANCE CALCULATION
router.put('/:id/approve', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    const journalEntry = await db.collection('journal')
      .findOne({ _id: new ObjectId(id) });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (journalEntry.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Only pending journal entries can be approved' 
      });
    }

    // Update journal entry status
    await db.collection('journal').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'approved',
          reviewedBy: req.user?.id || 'Manager',
          reviewedAt: new Date()
        } 
      }
    );

    // Process each account's ledger entry with proper balance calculation
    for (const entry of journalEntry.entries) {
      // Get the account details
      const account = await db.collection('accounts')
        .findOne({ account_number: entry.accountId });
      
      if (!account) {
        console.error(`Account ${entry.accountId} not found`);
        continue;
      }

      // Get the current balance from the last ledger entry for this account
      const lastLedgerEntry = await db.collection('ledger')
        .find({ accountId: entry.accountId })
        .sort({ date: -1, postedAt: -1 })
        .limit(1)
        .toArray();

      // Start with account's initial balance or last ledger balance
      let previousBalance = lastLedgerEntry.length > 0 
        ? lastLedgerEntry[0].balance 
        : (account.initial_balance || 0);

      // Calculate new balance based on normal side
      let newBalance = previousBalance;
      
      if (account.normal_side === 'L') {
        // Debit normal side (Assets, Expenses)
        newBalance = previousBalance + entry.debit - entry.credit;
      } else {
        // Credit normal side (Liabilities, Equity, Revenue)
        newBalance = previousBalance + entry.credit - entry.debit;
      }

      // Create ledger entry with calculated balance
      await db.collection('ledger').insertOne({
        date: new Date(journalEntry.date),
        accountId: entry.accountId,
        accountName: entry.accountName,
        description: journalEntry.description,
        journalId: id, // Link back to journal entry
        journalEntryId: id,
        journalEntryNumber: journalEntry.journalEntryNumber,
        postReference: `JE-${journalEntry.journalEntryNumber}`,
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        balance: newBalance, // Running balance
        postedAt: new Date(),
        postedBy: req.user?.id || 'Manager'
      });

      // Update the account's current balance
      await db.collection('accounts').updateOne(
        { account_number: entry.accountId },
        { 
          $set: { 
            balance: newBalance,
            updatedAt: new Date()
          },
          $inc: {
            debits: entry.debit || 0,
            credits: entry.credit || 0
          }
        }
      );
    }

    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Manager',
      action: 'APPROVE',
      targetType: 'journalEntry',
      targetId: id,
      details: `Approved journal entry JE-${journalEntry.journalEntryNumber}: ${journalEntry.description}`,
      timestamp: new Date()
    });

    res.status(200).json({ 
      message: 'Journal entry approved and posted to ledger',
      journalEntryNumber: journalEntry.journalEntryNumber
    });
  } catch (error) {
    console.error('Error approving journal entry:', error);
    res.status(500).json({ 
      error: 'Failed to approve journal entry: ' + error.message 
    });
  }
});

// PUT reject journal entry
router.put('/:id/reject', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ 
        error: 'Rejection comment is required' 
      });
    }

    const journalEntry = await db.collection('journal')
      .findOne({ _id: new ObjectId(id) });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (journalEntry.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Only pending journal entries can be rejected' 
      });
    }

    // Update journal entry status
    await db.collection('journal').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'rejected',
          reviewedBy: req.user?.id || 'Manager',
          reviewedAt: new Date(),
          comment: comment.trim()
        } 
      }
    );

    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Manager',
      action: 'REJECT',
      targetType: 'journalEntry',
      targetId: id,
      details: `Rejected journal entry: ${journalEntry.description}. Reason: ${comment}`,
      timestamp: new Date()
    });

    res.status(200).json({ 
      message: 'Journal entry rejected' 
    });
  } catch (error) {
    console.error('Error rejecting journal entry:', error);
    res.status(500).json({ error: 'Failed to reject journal entry' });
  }
});

// DELETE journal entry
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    const journalEntry = await db.collection('journal')
      .findOne({ _id: new ObjectId(id) });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Only allow deletion of pending or rejected entries
    if (journalEntry.status === 'approved') {
      return res.status(400).json({ 
        error: 'Cannot delete approved journal entries' 
      });
    }

    await db.collection('journal').deleteOne({ _id: new ObjectId(id) });

    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Unknown',
      action: 'DELETE',
      targetType: 'journalEntry',
      targetId: id,
      details: `Deleted journal entry: ${journalEntry.description}`,
      timestamp: new Date()
    });

    res.status(200).json({ 
      message: 'Journal entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

module.exports = router;