const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({ uers: 'works' }));

router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) return res.status(400).json({ email: 'email already exists' });
      const avatar = gravatar.url(req.body.email, { s: 200, r: 'pg', d: 'mm' });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(newuser => res.json({ newuser }))
            .catch(err => console.log(err));
        });
      });
    })
    .catch(err => console.log('err: ', err));
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ email: 'user not found' });
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) return res.json({ msg: 'success' });
      return res.status(400).json({ password: 'incorrect password' });
    });
  });
});

module.exports = router;
