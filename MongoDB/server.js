const express = require('express');
const app = express();
const { connectToDB } = require('./db');
const userRoutes = require('./routes/users');

app.use(express.json());
app.use('/api/users', userRoutes);

connectToDB().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
});
