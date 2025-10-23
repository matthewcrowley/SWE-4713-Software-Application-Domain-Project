const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

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
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const newEntry = req.body;

    if (!newEntry.description || !newEntry.entries) {
      return res.status(400).json({ message: 'Description and entries are required.' });
    }

    newEntry.status = newEntry.status || 'pending';
    newEntry.createdAt = new Date();

    const result = await db.collection('journal').insertOne(newEntry);
    res.status(201).json({ message: 'Journal entry created successfully.', id: result.insertedId });
  } catch (err) {
    console.error('Error creating journal entry:', err);
    res.status(500).json({ message: 'Failed to create journal entry.' });
  }
});

//Update a journal entry (approve or reject)
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
    console.error('Error deleting journal entry:', err);
    res.status(500).json({ message: 'Failed to delete journal entry.' });
  }
});

module.exports = router;