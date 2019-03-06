const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const validateProfileInput = require('../../validation/profile');

router.get('/test', (req, res) => res.json({ profile: 'works' }));

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'there is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then((profiles) => {
      if (!profiles) {
        errors.niprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});

router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }));
});

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  if (!isValid) return res.status(400).json(errors);

  const profileFields = {};
  profileFields.user = req.user.id;
  const profInfo = ['handle', 'company', 'website', 'location', 'bio', 'status', 'githubusername'];
  profInfo.forEach((info) => {
    if (req.body[info]) profileFields[info] = req.body[info];
  });

  if (typeof req.body.skills !== 'undefined') profileFields.skills = req.body.skills.split(',');

  profileFields.social = {};
  const socialArray = ['youtube', 'twitter', 'facebook', 'linkedin', 'instagram'];
  socialArray.forEach((social) => {
    if (req.body[social]) profileFields.social[social] = req.body[social];
  });

  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (profile) {
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
        .then(profileUpdated => res.json(profileUpdated));
    } else {
      Profile.findOne({ handle: profileFields.handle })
        .then((profile) => {
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
