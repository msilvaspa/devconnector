const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({ profile: 'works' }));

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'there is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  const profileFields = {};
  profileFields.user = req.user.id;

  const profileInfo = [
    'handle',
    'company',
    'website',
    'location',
    'bio',
    'status',
    'githubusername',
  ];

  profileInfo.forEach((info) => {
    if (req.body[info]) profileFields[info] = req.body[info];
  });

  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  profileFields.social = {};
  const socialArray = ['youtube', 'twitter', 'facebook', 'linkedin', 'instagram'];

  socialArray.forEach((social) => {
    if (req.body[social]) profileFields.social[social] = req.body[social];
  });

  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (profile) {
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(
        profileUpdated => res.json(profileUpdated),
      );
    } else {
      Profile.findOne({ handle: profileFields.handle }).then((profile) => {
        if (profile) {
          errors.handle = 'that handle already exists';
          res.status(400).json(errors);
        }
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

module.exports = router;
