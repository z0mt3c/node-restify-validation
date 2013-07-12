var utils = require('./utils');
var _ = require('underscore');
var assert = require('assert');

var validators = module.exports._validators = require('./validators');

var ignoredValidationKeys = module.exports._ignoredValidationKeys = ['msg'];
var validatorChainStore = module.exports._validationChainStore = {};

module.exports._generateValidationChain = function (validationRules) {
    // Reduces the array of validators into a new array with objects
    // with a validation method to call, the value to validate against
    // and the specified error message, if any
    var validationChain = _.reduce(validationRules, function (memo, validationRule) {
        _.each(_.difference(_.keys(validationRule), ignoredValidationKeys), function (validator) {
            if (_.has(validators, validator)) {
                var error = {
                    name: validator,
                    fn: validators[validator],
                    value: validationRule[validator],
                    msg: validationRule.msg
                };

                memo.push(error);
            }
        });
        return memo;
    }, []);

    return validationChain;
};

module.exports.getValidatorChain = function (key, validationRules, validationModel, req, recentErrors) {
    if (req && req.route && req.route.name && _.has(validatorChainStore, req.route.name)) {
        return validatorChainStore[req.route.name];
    }

    // TODO: Maybe? If the validator is a function or a string, wrap it in a function validator
    /*
     if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
     attrValidationSet = {
     fn: attrValidationSet
     };
     }*/

    // No array? Wrap it!
    if (!_.isArray(validationRules)) {
        validationRules = [validationRules];
    }

    var validationChain = this._generateValidationChain(validationRules);

    if (req && req.route && req.route.name) {
        validatorChainStore[req.route.name] = validationChain;
    }

    return validationChain;
};

module.exports.validateAttribute = function (key, validationRules, validationModel, req, recentErrors) {
    var validatorChain = this.getValidatorChain(key, validationRules, validationModel, req, recentErrors);
    var self = this;

    // process the validatorChain and reduce it to the first error
    return _.reduce(validatorChain, function (memo, validator) {
        var result = validator.fn.call(self, key, validator, validationRules, validationModel, req, recentErrors);

        if (result === false || memo === false) {
            return false;
        }

        if (result && !memo) {
            //TODO: change result?
            return validator;
        }

        return memo;
    }, '');
};

module.exports.process = function (validationModel, req, options) {
    assert.ok(validationModel, 'No validationModel present');
    var errors = [];
    var self = this;

    // fill missing fields with null
    _.each(validationModel, function (validationRules, key) {
        var error = self.validateAttribute(key, validationRules, validationModel, req, errors);

        if (error) {
            errors.push(error);
        }
    });

    return errors;
};