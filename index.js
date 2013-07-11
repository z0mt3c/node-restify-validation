var restify = require('restify');
var _ = require('underscore');

module.exports.handleErrors = function(errors, req, res, next) {
    return res.send(400, { status: "validation failed", errors: errors });
};

module.exports.processValidation = function(validationModel, req) {
    return [{ foo: "bar", bar: "foo"}];
};

var defaultOptions = {
    /* every parameter without validation will be removed from the request */
    strict: false
};

module.exports.validationPlugin = function(options) {
    options = _.extend(defaultOptions, options);
    var self = this;

    return function (req, res, next) {
        var validationModel = req.route ? req.route.validation : undefined;

        if (validationModel) {
            // validate
            var errors = self.processValidation(validationModel, req);

            if (errors && _.isArray(errors) && errors.length > 0) {
                return self.handleErrors(errors, req, res, next);
            }
        }

        next();
    }
};