const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

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

// GET journal entries by status
router.get('/status/:status', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.params;
    const journalEntries = await db.collection('journal')
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(journalEntries);
  } catch (error) {
    console.error('Error fetching journal entries by status:', error);
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

// POST create new journal entry
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { date, description, createdBy, entries } = req.body;

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
      status: 'pending',
      createdBy: createdBy, 
      createdAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      comment: ''
    };

    const result = await db.collection('journal').insertOne(newJournalEntry);
    
    // Log the event
    await db.collection('eventlogs').insertOne({
      userId: req.user?.id || 'Unknown',
      action: 'CREATE',
      targetType: 'journalEntry',
      targetId: result.insertedId.toString(),
      details: `Created journal entry: ${description}`,
      timestamp: new Date()
    });

    res.status(201).json({ 
      message: 'Journal entry created successfully',
      journalEntryId: result.insertedId,
      journalEntryNumber
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// PUT approve journal entry
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

    // Post entries to ledger
    const ledgerEntries = journalEntry.entries.map(entry => ({
      date: journalEntry.date,
      accountId: entry.accountId,
      accountName: entry.accountName,
      description: journalEntry.description,
      journalId: id,
      journalEntryNumber: journalEntry.journalEntryNumber,
      debit: entry.debit,
      credit: entry.credit,
      postedAt: new Date(),
      postedBy: req.user?.id || 'Manager'
    }));

    await db.collection('ledger').insertMany(ledgerEntries);

    // Update account balances
    for (const entry of journalEntry.entries) {
      const account = await db.collection('chart_of_accounts')
        .findOne({ accountNumber: entry.accountId });
      
      if (account) {
        let newBalance = account.balance || 0;
        
        // Debit increases assets and expenses, decreases liabilities, equity, and revenue
        // Credit decreases assets and expenses, increases liabilities, equity, and revenue
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
              updatedAt: new Date()
            } 
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
      timestamp: new Date()
    });

    res.status(200).json({ 
      message: 'Journal entry approved and posted to ledger' 
    });
  } catch (error) {
    console.error('Error approving journal entry:', error);
    res.status(500).json({ error: 'Failed to approve journal entry' });
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

// DELETE journal entry (optional - only if you want to allow deletion)
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