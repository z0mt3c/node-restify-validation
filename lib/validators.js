var _ = require('underscore');
var _s = require('underscore.string');
var validator = require('validator/lib/validators');
var utils = require('./utils');

var validators = module.exports = {
    isRequired: function (key, submittedValue, validator) {
        var isRequired = _.isFunction(validator.value) ? validator.value.call(this, key, validator) : validator.value;

        if (!isRequired && _.isNull(submittedValue)) {
            return false;
        }

        if (isRequired && !utils.hasValue(submittedValue)) {
            return true;
        }
    }
};

var validatorFunctionKeys = _.functions(validator);

_.each(validatorFunctionKeys, function (element, index, array) {
    var validatorFunction = validator[element];

    validators[element] = function (key, submittedValue, myValidator) {
        var requiredValue = myValidator.value;
        var isRequired = _.isFunction(requiredValue) ? requiredValue.call(this, key, validator) : requiredValue;

        if (isRequired && !validatorFunction(submittedValue, requiredValue)) {
            return true;
        }
    };
});