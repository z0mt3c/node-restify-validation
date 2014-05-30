var _ = require('underscore');

module.exports.paramMatches = function (param, value) {
    if (_.isArray(value)) {
        return function() {
            return _.contains(value, this.req.params[param]);
        };
    } else {
        return function() {
            return _.isEqual(value, this.req.params[param]);
        };
    }
};

module.exports.exists = function (param, value) {
    return function(){
        return !_.isUndefined(this.req.params[param]);
    }
};
