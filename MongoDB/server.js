const express = require('express');
const cors = require('cors');
const app = express();
const { connectToDB } = require('./db');
const registerRoutes = require('./routes/register');
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use('/api/register', registerRoutes);

connectToDB()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  })
  .catch((err) => console.error('Failed to connect to DB:', err));
