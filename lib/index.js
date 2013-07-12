var _ = require('underscore');

module.exports.utils = require('./utils');
module.exports.validation = require('./validation');
module.exports.error = require('./error');

var defaultOptions = {
    defaultScope: 'params'
};

module.exports.validationPlugin = function (options) {
    options = _.extend(defaultOptions, options);
    var self = this;

    return function (req, res, next) {
        var validationModel = req.route ? req.route.validation : undefined;

        if (validationModel) {
            // validate
            var errors = self.validation.process(validationModel, req, options);

            if (errors && _.isArray(errors) && errors.length > 0) {
                return self.error.handle(errors, req, res, options, next);
            }
        }

        next();
    };
};