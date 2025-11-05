const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const {ObjectId} = require('mongodb');
const multer = require('multer');
const upload = multer();


//Get all journal entries
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const entries = await db.collection('journal').find().toArray();
    res.json(entries);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    res.status(500).json({ message: 'Failed to fetch journal entries.' });
  }
});

//Get a single journal entry by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const entry = await db.collection('journal').findOne({ _id: new ObjectId(req.params.id) });

    if (!entry) {
      return res.status(404).json({ message: 'Journal Entry not found.' });
    }

    res.json(entry);
  } catch (err) {
    console.error('Error fetching entry by ID:', err);
    res.status(500).json({ message: 'Failed to fetch journal entry.' });
  }
});

//Create a new journal entry
router.post('/', upload.array('attachments', 10), async (req, res) => {
  try {
    const db = getDB();

    console.log("Incoming body:", req.body); // debug

    const { date, description, createdBy, status, isAdjustingEntry } = req.body;
    const entries = JSON.parse(req.body.entries || '[]');

    // Validate required fields
    if (!date || !description || entries.length < 2) {
      return res.status(400).json({
        error: 'Date, description, and at least 2 entries are required.',
      });
    }

    const attachments = (req.files || []).map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));

    const newEntry = {
      date,
      description,
      createdBy,
      status: status || 'pending',
      isAdjustingEntry: isAdjustingEntry === 'true' || isAdjustingEntry === true,
      entries,
      attachments,
      createdAt: new Date(),
    };

    const result = await db.collection('journal').insertOne(newEntry);
    res.status(201).json({
      message: 'Journal entry created successfully.',
      id: result.insertedId,
    });
  } catch (err) {
    console.error('Error creating journal entry:', err);
    res.status(500).json({ error: 'Failed to create journal entry.' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    const journalEntry = await db.collection('journal').findOne({ _id: new ObjectId(id) });
    if (!journalEntry) return res.status(404).json({ error: 'Journal entry not found' });

    if (journalEntry.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending journal entries can be approved' });
    }

    // Update journal entry status to approved
    await db.collection('journal').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          reviewedBy: req.user?.id || 'Manager',
          reviewedAt: new Date(),
        },
      }
    );

   // Post entries to ledger only if accountId exists
    const ledgerEntries = journalEntry.entries
      .filter(entry => entry.accountId && entry.accountId.trim() !== '') // skip empty accountId
      .map(entry => {
        // fetch account info from chart_of_accounts
        const account = db.collection('chart_of_accounts').findOne({ account_number: entry.accountId });

        return {
          date: journalEntry.date,
          accountId: entry.accountId,
          accountName: entry.accountName || (account ? account.accountName : 'Unknown Account'),
          description: journalEntry.description,
          journalId: id,
          journalEntryNumber: journalEntry.journalEntryNumber || null,
          debit: entry.debit,
          credit: entry.credit,
          postedAt: new Date(),
          postedBy: req.user?.id || 'Manager',
        };
      });

    // Only insert if there are valid entries
    if (ledgerEntries.length > 0) {
      await db.collection('ledger').insertMany(ledgerEntries);
    }

    // Update account balances
    for (const entry of journalEntry.entries) {
      const account = await db.collection('chart_of_accounts').findOne({ accountNumber: entry.accountId });

      if (account) {
        let newBalance = account.balance || 0;

        if (['Asset', 'Expense'].includes(account.accountCategory)) {
          newBalance += entry.debit - entry.credit;
        } else {
          newBalance += entry.credit - entry.debit;
        }

        await db.collection('chart_of_accounts').updateOne(
          { accountNumber: entry.accountId },
          {
            $set: {
              balance: newBalance,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Manager',
      action: 'APPROVE',
      targetType: 'journalEntry',
      targetId: id,
      details: `Approved journal entry: ${journalEntry.description}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: 'Journal entry approved and posted to ledger' });
  } catch (error) {
    console.error('Error approving journal entry:', error.stack || error);
    res.status(500).json({ error: 'Failed to approve journal entry' });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { comment } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid journal entry ID' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Rejection comment is required' });
    }

    const journalEntry = await db.collection('journal').findOne({ _id: new ObjectId(id) });
    if (!journalEntry) return res.status(404).json({ error: 'Journal entry not found' });

    if (journalEntry.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending journal entries can be rejected' });
    }

    await db.collection('journal').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          reviewedBy: req.user?.id || 'Manager',
          reviewedAt: new Date(),
          comment: comment.trim(),
        },
      }
    );

    // Log rejection event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Manager',
      action: 'REJECT',
      targetType: 'journalEntry',
      targetId: id,
      details: `Rejected journal entry: ${journalEntry.description}. Reason: ${comment}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: 'Journal entry rejected' });
  } catch (error) {
    console.error('Error rejecting journal entry:', error);
    res.status(500).json({ error: 'Failed to reject journal entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const updateData = req.body;

    const result = await db.collection('journal').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Journal Entry not found.' });
    }

    res.json({ message: 'Journal entry updated successfully.' });
  } catch (err) {
    console.error('Error updating journal entry:', err);
    res.status(500).json({ message: 'Failed to update journal entry.' });
  }
});

//Delete a journal entry
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');

    const result = await db.collection('journal').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Journal Entry not found.' });
    }

    res.json({ message: 'Journal entry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting journal entry:', err.stack || error);
    res.status(500).json({ message: 'Failed to delete journal entry.' });
  }
});

module.exports = router;