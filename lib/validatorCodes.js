/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var validatorDefaultError = require('validator/lib/defaultError');
var _ = require('underscore');

var messages = module.exports.messages = {
    isRequired: 'Field is required',
    equalTo: 'Needs to equal (THE OTHER FIELD)'
};

_.extend(messages, validatorDefaultError);

var codes = module.exports.codes = {
    _default: 'INVALID',
    isRequired: 'MISSING'
};

