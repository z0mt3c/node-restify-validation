/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var _ = require('underscore');

module.exports.utils = require('./utils');
module.exports.validation = require('./validation');
module.exports.error = require('./error');
module.exports.when = require('./conditions');

var defaultOptions = {
    errorsAsArray: true
};

module.exports.validationPlugin = function (options) {
    options = _.extend(defaultOptions, options);
    var self = this;

    return function (req, res, next) {
        var validationModel = req.route ? req.route.validation : undefined;

        if (validationModel) {
            // validate
            var errors = self.validation.process(validationModel, req, options);

            if (errors && (options.errorsAsArray && errors.length > 0) || (!options.errorsAsArray && _.keys(errors).length > 0)) {
                return self.error.handle(errors, req, res, options, next);
            }
        }

        next();
    };
};