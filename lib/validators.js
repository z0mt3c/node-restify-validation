/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var _         = require('lodash');
var validator = require('./compatible-validator');
var utils     = require('./utils');

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