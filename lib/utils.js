var _ = require('underscore');

var flatten = module.exports.flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function(val, key) {
        if(obj.hasOwnProperty(key)) {
            if (val && typeof val === 'object' && !(val instanceof Date || val instanceof RegExp)) {
                flatten(val, into, prefix + key + '.');
            } else {
                into[prefix + key] = val;
            }
        }
    });

    return into;
};