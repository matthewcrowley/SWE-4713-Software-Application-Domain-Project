const express = require('express');

const cors = require('cors');

const app = express();

const {connectToDB, getDB} = require('./db');

const registerRoutes = require('./routes/register');

const usersRoutes = require('./routes/users');

const emailRoutes = require('./routes/email');

const eventLogRoutes = require('./routes/eventlog');

const { updateAccount } = require('./eventLogger');
let db;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/register', registerRoutes);

app.use('/api/users', usersRoutes);

app.use('/api/email', emailRoutes);

app.use((req, res, next) => {
  req.user = { id: 'Sweetledger Admin' };
  next();
});

app.use('/api/eventlog', eventLogRoutes);

connectToDB()
  .then(() => {
    db = getDB();
    app.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  })
  .catch((err) => console.error('Failed to connect to DB:', err));

  app.use((req, res, next) => {
  req.user = { id: 'Sweetledger Admin' }; // you must replace this with actual authenticated user ID
  next();
});

app.put('/api/accounts/:id', async (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;
  const updateData = req.body;

  try {
    await updateAccount(userId, accountId, updateData, db);
    res.status(200).send({ message: 'Account updated with event log' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});