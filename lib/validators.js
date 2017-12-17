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
var validator = require('./compatible-validator');
var utils = require('./utils');

var validators = module.exports = {
    
    isRequired: function (key, submittedValue, myValidator) {
        var isRequired = _.isFunction(myValidator.value) ? myValidator.value.call(this, key, myValidator) : myValidator.value;

        if (!isRequired && !utils.hasValue(submittedValue)) {
            return false;
        } else if (isRequired && !utils.hasValue(submittedValue)) {
            return true;
        }
    },
    equalTo: function(key, submittedValue, myValidator) {
        if (!_.isEqual(submittedValue, this.req[this.scope][myValidator.value])) {
            return true;
        }
    },
    isArray: function (key, submittedValue, myValidator) {
        var isArray = _.isFunction(myValidator.value) ? myValidator.value.call(this, key, myValidator) : myValidator.value;

        if (!isArray) {
            if (_.isArray(submittedValue)) {
                myValidator.msg = 'Field is an array';
                return true;
            }
        } else if (submittedValue && !_.isArray(submittedValue)) {
            myValidator.msg = 'Field is not array';
            return true;
        } else if (submittedValue && _.isObject(isArray)) {
            if (isArray.minLength && submittedValue.length < isArray.minLength) {
                myValidator.msg = 'Not enough elements';
                return true;
            }
            if (isArray.maxLength && submittedValue.length > isArray.maxLength) {
                myValidator.msg = 'Too many elements';
                return true;
            }
        }
    },
    isObject: function (key, submittedValue, myValidator) {
        var isObject = _.isFunction(myValidator.value) ? myValidator.value.call(this, key, myValidator) : myValidator.value;
        if (!isObject) {
            if (_.isObject(submittedValue) && !_.isArray(submittedValue)) {
                myValidator.msg = 'Field is an object';
                return true;
            }
        } else if (!_.isObject(submittedValue) || _.isArray(submittedValue)) {
            myValidator.msg = 'Field is not object';
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