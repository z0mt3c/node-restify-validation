/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var _         = require('lodash');
var validator = require('validator');
var utils     = require('./utils');

// Because of changes in the new node-validator library we need to add a few functions
// for backwards compatibility
//
var compatibleValidator = Object.create( validator );

// Add the min/max validators
//
compatibleValidator.min = function(str, val)
{
    var number = parseFloat(str);
    return isNaN(number) || number >= val;
};

compatibleValidator.max = function(str, val)
{
    var number = parseFloat(str);
    return isNaN(number) || number <= val;
};

// Old isDecimal implementation doesn't exist anymore
//
compatibleValidator.isDecimal = function(str)
{
    return validator.isFloat(str);
};

// notIn is just inverted isIn
//
compatibleValidator.notIn = function(str, options)
{
    return !validator.isIn(str, options);
};

// Regular expression method now all use matches function
//
compatibleValidator.is = compatibleValidator.regex = function(str, pattern, modifiers)
{
    return validator.matches(str, pattern, modifiers);
};
compatibleValidator.not = compatibleValidator.notRegex = function(str, pattern, modifiers)
{
    return !validator.matches(str, pattern, modifiers);
};

compatibleValidator.notContains = function(str, elem)
{
    return !validator.contains(str, elem);
};

// New isURL validator has options
//
compatibleValidator.isURL = function(str)
{
    return validator.isURL(str);
};

// IP checking validators now take a version parameter
//
compatibleValidator.isIP = function(str)
{
    return validator.isIP(str);
};

compatibleValidator.isIPv4 = function(str)
{
    return validator.isIP(str, 4);
};

compatibleValidator.isIPv6 = function(str)
{
    return validator.isIP(str, 6);
};

// The isUUID validator now supports a version parameter
//
compatibleValidator.isUUID = function(str)
{
    return validator.isUUID(str);
};
compatibleValidator.isUUIDv3 = function(str)
{
    return validator.isUUID(str, 3);
};
compatibleValidator.isUUIDv4 = function(str)
{
    return validator.isUUID(str, 4);
};
compatibleValidator.isUUIDv5 = function(str)
{
    return validator.isUUID(str, 5);
};

var validators = module.exports = {
    isRequired: function (key, submittedValue, myValidator) {
        var isRequired = _.isFunction(myValidator.value) ? myValidator.value.call(this, key, myValidator) : myValidator.value;

        if (!isRequired && !utils.hasValue(submittedValue)) {
            return false;
        }

        if (isRequired && !utils.hasValue(submittedValue)) {
            return true;
        }
    },
    equalTo: function(key, submittedValue, myValidator) {
        if (!_.isEqual(submittedValue, this.params[myValidator.value])) {
            return true;
        }
    }
};


var notSupported = ['len', 'notNull', 'isNull', 'notEmpty'];
var validatorFunctionKeys = _.difference(_.functions(compatibleValidator), notSupported);

_.each(validatorFunctionKeys, function (element, index, array) {
    if (!_.has(validators, element)) {
        var validatorFunction = compatibleValidator[element];

        validators[element] = function (key, submittedValue, myValidator) {
            var requiredValue = myValidator.value;
            var isRequired = _.isFunction(requiredValue) ? requiredValue.call(this, key, compatibleValidator) : requiredValue;

            if (isRequired && (!utils.hasValue(submittedValue) || (!validatorFunction(submittedValue, requiredValue)))) {
                return true;
            }
        };
    }
});