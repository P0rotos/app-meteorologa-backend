const express = require('express');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'});
});

const usersRouter = require('./routes/users');
const weatherRouter = require('./routes/weather');

app.use('/users', usersRouter);
app.use('/weather', weatherRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
   });