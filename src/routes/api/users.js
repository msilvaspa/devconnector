const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../models/User');
const keys = require('../../config/keys').secretOrKey;

const validateRegisterInput = require('../../validation/register');

router.get('/test', (req, res) => res.json({ uers: 'works' }));

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) return res.status(400).json(errors);

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
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) return res.status(404).json({ email: 'user not found' });
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          return jwt.sign(payload, keys, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ success: true, token: `Bearer ${token}` });
          });
        }
        return res.status(400).json({ password: 'incorrect password' });
      });
    })
    .catch(err => console.log('err: ', err));
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

module.exports = router;
