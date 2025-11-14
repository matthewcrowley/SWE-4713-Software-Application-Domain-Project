const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const app = express();
const {connectToDB, getDB} = require('./db');
const registerRoutes = require('./routes/register');
const usersRoutes = require('./routes/users');
const emailRoute = require('./routes/email');
const eventLogRoutes = require('./routes/eventlog');
const chartOfAccountsRoute = require('./routes/chartofaccounts');
const journalEntriesRoute = require('./routes/journalentries');
const ledgerRoutes = require('./routes/ledger');
const curUserRoutes = require('./routes/curUser');
const { updateAccount } = require('./eventLogger');
const financialRatiosRoute = require('./routes/financialRatios');
const managerAlertsRoute = require('./routes/managerAlerts');


let db;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: 'Sweetledger Admin' };
  next();
});
app.use('/api/register', registerRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/email', emailRoute);
app.use('/api/eventlog', eventLogRoutes);
app.use('/api/accounts', chartOfAccountsRoute);
app.use('/api/journal-entries', journalEntriesRoute);
app.use('/api/ledger', ledgerRoutes); 
app.use('/api/curUser', curUserRoutes);
app.use('/api/financial-ratios', financialRatiosRoute);
app.use('/api/manager-alerts', managerAlertsRoute);


connectToDB()
  .then(() => {
    db = getDB();
    app.locals.db = db;
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  })
  .catch((err) => console.error('Failed to connect to DB:', err));

  app.use((q, res, next) => {
  q.user = { id: 'Sweetledger Admin' };
  next();
});

app.put('/api/accounts/:id', async (q, res) => {
  const userId = q.user.id;
  const accountId = q.params.id;
  const updateData = q.body;

  try {
    await updateAccount(userId, accountId, updateData, db);
    res.status(200).send({ message: 'Account updated with event log' });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});