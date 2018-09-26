require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const indexRoute = require('./routes/indexRoute');
const userRoute = require('./routes/userRoute');
const questionRoute = require('./routes/questionRoute');
const answerRoute = require('./routes/answerRoute');

app.use('/', indexRoute);
app.use('/users', userRoute);
app.use('/questions', questionRoute);
app.use('/answers', answerRoute);

const mlabUsername = process.env.MLAB_USERNAME;
const mlabPassword = process.env.MLAB_PASSWORD;

mongoose.connect(`mongodb://${mlabUsername}:${mlabPassword}@ds111913.mlab.com:11913/hacktiv-overflow`, { useNewUrlParser: true })
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`Connected hacktiv-overflow db!`);
});

app.listen(process.env.PORT, () => {
  console.log('listening on port 3000!')
})

module.exports = app;