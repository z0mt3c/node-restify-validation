var _ = require('underscore');
var _s = require('underscore.string');
var validator = require('validator/lib/validators');

var validators = module.exports = {
    isRequired: function (key, validator, validationRules, validationModel, req, recentErrors) {
        var isRequired = _.isFunction(validator.value) ? validator.value.call(this, key, validator, validationRules, validationModel, req, recentErrors) : validator.value;

        if (!isRequired && _.isNull(req.params[key])) {
            return false;
        }

        if (isRequired && (_.isUndefined(req.params[key]) || _s.isBlank(req.params[key]))) {
            return true;
        }
    }
};

var validatorFunctionKeys = _.functions(validator);

_.each(validatorFunctionKeys, function (element, index, array) {
    var validatorFunction = validator[element];

    validators[element] = function (key, myValidator, validationRules, validationModel, req, recentErrors) {
        var submittedValue = req.params[key];
        var requiredValue = myValidator.value;

        var isRequired = _.isFunction(requiredValue) ? requiredValue.call(this, key, validator, validationRules, validationModel, req, recentErrors) : requiredValue;

        if (isRequired && !validatorFunction(submittedValue, requiredValue)) {
            return true;
        }
    };
});