/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var _ = require('underscore');
var validator = require('validator/lib/validators');
var utils = require('./utils');

var validators = module.exports = {
    isRequired: function (key, submittedValue, validator) {
        var isRequired = _.isFunction(validator.value) ? validator.value.call(this, key, validator) : validator.value;

        if (!isRequired && !utils.hasValue(submittedValue)) {
            return false;
        }

        if (isRequired && !utils.hasValue(submittedValue)) {
            return true;
        }
    },
    equalTo: function(key, submittedValue, validator) {
        if (!_.isEqual(submittedValue, this.params[validator.value])) {
            return true;
        }
    }
};


var notSupported = ['len', 'notNull', 'isNull', 'notEmpty'];
var validatorFunctionKeys = _.difference(_.functions(validator), notSupported);

_.each(validatorFunctionKeys, function (element, index, array) {
    if (!_.has(validators, element)) {
        var validatorFunction = validator[element];

        validators[element] = function (key, submittedValue, myValidator) {
            var requiredValue = myValidator.value;
            var isRequired = _.isFunction(requiredValue) ? requiredValue.call(this, key, validator) : requiredValue;

            if (isRequired && (!utils.hasValue(submittedValue) || (!validatorFunction(submittedValue, requiredValue)))) {
                return true;
            }
        };
    }
});