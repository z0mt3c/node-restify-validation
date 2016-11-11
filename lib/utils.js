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

module.exports._speratorChar = '.';
var internalToExternalScope = {
    resources: 'params',
    queries: 'query',
    content: 'body',
    files: 'files',
    headers: 'headers'
};

var hasValue = module.exports.hasValue = function(value) {
    var result;
    if(_.isArray(value)) {
        result = value.length > 0;
    } else {
        result = !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && value.trim() === ''));
    }
    return result;
};

module.exports.getScopeKeys = Object.keys(internalToExternalScope);

var getExternalScope = module.exports.getExternalScope = function (scope) {
    return internalToExternalScope[scope];
};

var getInternalScope = module.exports.getInternalScope = function (scope) {
    for(var key in internalToExternalScope) {
        if(internalToExternalScope.hasOwnProperty( key ) && internalToExternalScope[key] === scope) {
            return key;
        }
    }
};
