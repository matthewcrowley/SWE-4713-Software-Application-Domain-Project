const express = require('express');
const router = express.Router();

let journalEntries = [
];

router.get('/', (req, res) => {
  res.json(journalEntries);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entry = journalEntries.find(e => e.id === id);
  if (entry) {
    res.json(entry);
  } else {
    res.status(404).json({ message: 'Journal Entry was not found' });
  }
});

router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'The title and content are required' });
  }

  const newEntry = {
    id: journalEntries.length ? journalEntries[journalEntries.length - 1].id + 1 : 1,
    title,
    content,
  };
  journalEntries.push(newEntry);
  res.status(201).json(newEntry);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entryIndex = journalEntries.findIndex(e => e.id === id);

  if (entryIndex === -1) {
    return res.status(404).json({ message: 'Journal Entry was not found' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'The title and content are required' });
  }

  journalEntries[entryIndex] = { id, title, content };
  res.json(journalEntries[entryIndex]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entryIndex = journalEntries.findIndex(e => e.id === id);

  if (entryIndex === -1) {
    return res.status(404).json({ message: 'Journal Entry was not found' });
  }

  journalEntries.splice(entryIndex, 1);
  res.status(204).send();
});

module.exports = router;