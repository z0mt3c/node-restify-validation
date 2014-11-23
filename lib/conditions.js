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
var utils = require('./utils')

module.exports.paramMatches = function (params) {
    return conditionalChecker(params, function (matches, value) {
        var result;
        if (_.isArray(matches)) {
            result = _.contains(matches, value);
        } else {
            result = _.isEqual(matches, value);
        }
        return result;
    });
};

module.exports.exists = function (params) {
    return conditionalChecker(params, function (matches, value) {
        return !_.isUndefined(value);
    });
};

var conditionalChecker = module.exports.conditionalChecker = function (params, validator) {
    return function () {
        var scope = !params.scope ? this.scope : utils.getExternalScope(params.scope);
        var variable = params.variable;
        var matches = params.matches;
        return validator(matches, this.req[scope][variable]);
    };
}
