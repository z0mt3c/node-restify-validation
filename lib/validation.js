/*
 * The MIT License
 *
 * Copyright 2014 Timo Behrmann, Guillaume Chauvet.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var _ = require('lodash');
var assert = require('assert');
var utils = require('./utils');

var validators = module.exports._validators = require('./validators');
var validatorCodes = module.exports._validatorCodes = require('./validatorCodes');

var ignoredValidationKeys = module.exports._ignoredValidationKeys = ['msg', 'description', 'swaggerType'];
var validatorChainStore = module.exports._validationChainStore = {};

module.exports._generateValidationChain = function (validationRules) {
    // Reduces the array of validators into a new array with objects
    // with a validation method to call, the value to validate against
    // and the specified error message, if any
    return _.reduce(validationRules, function (memo, validationRule) {
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
};

module.exports.getValidatorChain = function (keys, validationRules, validationModel, scope, req, options, recentErrors) {
    keys = keys || [];
    var value = '['+scope+':'+keys.join('.')+']';
    if (req && req.route && req.route.name && _.has(validatorChainStore, req.route.name+value)) {
        return validatorChainStore[req.route.name+value];
    }

    // No array? Wrap it!
    if (!_.isArray(validationRules)) {
        validationRules = [validationRules];
    }

    var validationChain = this._generateValidationChain(validationRules);

    if (req && req.route && req.route.name) {
        validatorChainStore[req.route.name+value] = validationChain;
    }

    return validationChain;
};

module.exports.validateAttribute = function (descriptor, keys, scopeValue, validationRules, validationModel, scope, req, options, recentErrors) {
    var validatorChain = this.getValidatorChain(keys, validationRules, validationModel, scope, req, options, recentErrors);
    var self = this;
    var key = _.last(keys);

    var submittedValue = typeof scopeValue === 'function' ? scopeValue.apply(req) : scopeValue !== undefined ? scopeValue[key] : undefined;
    var supportsMultipleValues = validationRules.multiple === true;
    var isArray = _.isArray(submittedValue);
    var doSingleCheck = !(isArray && supportsMultipleValues);

    var context = {
        req: req,
        scope: scope,
        validationModel: validationModel,
        validationRules: validationRules,
        options: options,
        recentErrors: recentErrors,
        validateProperties: function(scopeValue, validationRules) {
            return self.validateObject(descriptor, keys, scopeValue, validationRules, validationModel, scope, req, options, recentErrors, self);
        },
        validateValue: function(index, scopeValue, validationRules) {
            return self.validateAttribute(descriptor + index, keys, scopeValue, validationRules, validationModel, scope, req, options, recentErrors);
        }
    };
    // process the validatorChain and reduce it to the first error
    return _.reduce(validatorChain, function (memo, validator) {
        var result;

        if (doSingleCheck) {
            try {
                result = validator.fn.call(context, key, submittedValue, validator);
            }
            catch (err) {
                result = true;
            }
        } else if (!doSingleCheck) {
            var invalidValue = _.find(submittedValue, function(currentValue) {
                var returnVal;
                try {
                    returnVal = validator.fn.call(context, key, currentValue, validator);
                }
                catch (err) {
                    returnVal = true;
                }
                return returnVal;
            });

            if (!_.isUndefined(invalidValue)) {
                return true;
            }
        }

        if (result === false || memo === false) {
            return false;
        }

        if (result && !memo) {
            if (_.isObject(result)) {
                return result;
            } else {
                return self.createError(scope, descriptor, validator);
            }
        }

        return memo;
    }, '');
};

function _createError(scope, descriptor, validator) {
    var error = {
        scope: utils.getInternalScope(scope),
        field: descriptor,
        type: validatorCodes.codes[validator.name] || validatorCodes.codes._default
    };

    var message = validator.msg || validatorCodes.messages[validator.name] || validatorCodes.messages._default;

    if (message) {
        error.reason = message;
    }


    return error;
}

module.exports.createError = _createError;

module.exports.process = function (validationModel, req, options) {
    assert.ok(validationModel, 'No validationModel present');

    var errors = options.errorsAsArray === false ? {} : [];
    var self = this;

    // fill missing fields with null
    _.each(validationModel, function (validationRulesScope, scope) {
        var realScope = utils.getExternalScope(scope);
        if(!realScope) {
            addError(errors, _createError(scope, realScope, {msg: "Invalid scope. Must be in [" + utils.getScopeKeys + "]."}), realScope, options);
        } else {
            self.validateObject("", [], req[realScope], validationRulesScope, validationModel, realScope, req, options, errors);
        }
    });
    return errors;
};

function addError(errors, error, key, options) {
    if (error) {
        if (options.errorsAsArray === false) {
            errors[key] = error;
        } else {
            errors.push(error);
        }
    }
}

function describeKey(descriptor, key) {
    return descriptor ? descriptor + '.' + key : key;
}

module.exports.validateObject = function (descriptor, keys, scopeValue, validationRulesScope, validationModel, realScope, req, options, errors) {
    var self = this;
    try {
        var keys = scopeValue ? (typeof scopeValue === 'object' ? Object.keys(scopeValue) : []) : [];
        _.each(validationRulesScope, function (validationRules, key) {
            addError(errors, self.validateAttribute(describeKey(descriptor, key), keys.concat([key]), scopeValue, validationRules, validationModel, realScope, req, options, errors), key, options);
            var index = keys.indexOf(key);
            if (index > -1) {
                keys.splice(index, 1);
            }
        });
        if (options.forbidUndefinedVariables === true) {
            keys.forEach(function (key) {
                var invalid = true;

                // check if key exist in some other scope in the validationModel
                _.each(validationModel, function (validationModelScope) {
                    if (key in validationModelScope) {
                        invalid = false;
                    }
                });

                // flag key as undefined if it didn't show up in another scope
                if (invalid) {
                    addError(errors, _createError(realScope, describeKey(descriptor, key), {name: "undefinedVariable"}), undefined, options);
                }
            });
        }
    } catch (e) {
    }
};
