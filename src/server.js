const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

const app = express();

const db = require('./config/keys').mongoURI;

const PORT = process.env.PORT || 3000;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('database connected successfuly'))
  .catch(err => console.log(`db conn err: ${err}`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

app.get('/', (req, res) => res.send('oi'));

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
