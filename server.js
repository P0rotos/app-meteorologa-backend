const express = require('express');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'});
});

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
   });