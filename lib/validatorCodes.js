var validatorDefaultError = require('validator/lib/defaultError');
var _ = require('underscore');

var messages = module.exports.messages = {
    isRequired: 'Field %s is required',
    isEmail: '%s is no valid email in field %s'
};

_.extend(messages, validatorDefaultError);

var codes = module.exports.codes = {
    _default: 'INVALID',
    isRequired: 'MISSING'
};

