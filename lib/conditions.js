var _ = require('lodash');

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

module.exports.exists = function (param) {
    return function(){
        return !_.isUndefined(this.req.params[param]);
    };
};
