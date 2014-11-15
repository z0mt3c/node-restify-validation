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
var _s = require('underscore.string');

var seperatorChar = module.exports._speratorChar = '.';

var flatten = module.exports.flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function (val, key) {
        if (obj.hasOwnProperty(key)) {
            if (val && !_.isArray(val) && typeof val === 'object' && !(val instanceof Date || val instanceof RegExp)) {
                flatten(val, into, prefix + key + seperatorChar);
            } else {
                into[prefix + key] = val;
            }
        }
    });

    return into;
};

var deflat = module.exports.deflat = function (obj) {
    var into = {};

    _.each(obj, function (val, key) {
        var splitted = key.split(seperatorChar);

        var cursor = into;

        _.each(splitted, function(partialKey, i) {
            if (i === (splitted.length - 1)) {
                // last one -> set value!
                cursor[partialKey] = val;
            } else {
                if (!_.has(cursor, partialKey)) {
                    cursor = cursor[partialKey] = {};
                } else {
                    cursor = cursor[partialKey];
                }
            }
        });
    });

    return into;
};

var hasValue = module.exports.hasValue = function(value) {
    return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && _s.trim(value) === '')) || _.isArray(value);
};