/* eslint-disable no-param-reassign */
const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
  const errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';

  if (!Validator.isLength(data.handle, { min: 2, max: 40 })) errors.handle = 'Handle needs to be between 2 and 40 characters';

  if (Validator.isEmpty(data.handle)) errors.handle = 'Profile handle is required';

  if (Validator.isEmpty(data.status)) errors.status = 'Status field is required';

  if (Validator.isEmpty(data.skills)) errors.skills = 'skills field is required';

  const websites = ['website', 'youtube', 'twitter', 'linkedin', 'instgram'];

  websites.forEach((site) => {
    if (!isEmpty(data[site])) if (!Validator.isURL(data[site])) errors[site] = 'not a valid URL';
  });

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
