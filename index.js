var restify = require('restify');
var _ = require('underscore');

var onError = function(errors, req, res, next) {
    return res.send(400, { status: "validation failed", errors: errors });
};

var processValidation = function(validationModel, req) {
    return [{ foo: "bar", bar: "foo"}];
};

var defaultOptions = {
    /* every parameter without validation will be removed from the request */
    strict: false,

    /* hooks */
    onError: onError
};

module.exports = function (options) {
    options = _.extend(defaultOptions, options);

    return function (req, res, next) {
        var validationModel = req.route.validation;

        if (validationModel) {
            // validate
            var errors = processValidation(validationModel, req);

            if (errors && _.isArray(errors) && errors.length > 0) {
                return options.onError(errors, req, res, next);
            }
        }

        next();
    }
};