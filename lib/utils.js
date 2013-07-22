/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var _ = require('underscore');
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