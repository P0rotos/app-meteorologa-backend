const express = require('express');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'});
});

const usersRouter = require('./routes/users');
const weatherRouter = require('./routes/weather');
const activitiesRouter = require('./routes/activities');
const userPreferencesRouter = require('./routes/user-preferences');

app.use('/users', usersRouter);
app.use('/weather', weatherRouter);
app.use('/activities', activitiesRouter);
app.use('/user-preferences', userPreferencesRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
   });