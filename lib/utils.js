var _ = require('underscore');
var _s = require('underscore.string');

var flatten = module.exports.flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function (val, key) {
        if (obj.hasOwnProperty(key)) {
            if (val && typeof val === 'object' && !(val instanceof Date || val instanceof RegExp)) {
                flatten(val, into, prefix + key + '.');
            } else {
                into[prefix + key] = val;
            }
        }
    });

    return into;
};

var hasValue = module.exports.hasValue = function(value) {
    return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && _s.trim(value) === ''));
};