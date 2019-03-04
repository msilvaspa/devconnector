/* eslint-disable no-param-reassign */
const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  console.log('comming data:', data);
  const errors = {};
  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';
  console.log(data);

  if (!validator.isLength(data.name, { min: 2, max: 30 })) errors.name = 'name must be between 2 and 30 characters';

  if (validator.isEmpty(data.name)) errors.name = 'Name field is required';

  if (validator.isEmpty(data.email)) errors.email = 'email field is required';

  if (!validator.isEmail(data.email)) errors.email = 'email is invalid';

  if (validator.isEmpty(data.password)) errors.password = 'Password field is required';

  if (!validator.isLength(data.password, { min: 6, max: 30 })) errors.password = 'Password field is invalid: min 6, max 30';

  if (validator.isEmpty(data.password2)) errors.password2 = 'confirm Password2 field is required';

  if (validator.equals(data.password, data.password2)) errors.password2 = 'passwords must match';

  if (validator.isEmpty(data.name)) errors.name = 'Name field is required';
  console.log(errors);
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
