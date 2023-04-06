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
var self = {
  validation: require('./validation'),
  error: require('./error'),
  model: require('./model'),
  when: require('./conditions')
};

module.exports.validation = self.validation;
module.exports.error = self.error;
module.exports.when = self.when;
module.exports.validatorModels = self.model.validatorModels;

var defaultOptions = {
    errorsAsArray: true,
    errorHandler: false,
    forbidUndefinedVariables: false,
    validatorModels: {},
    isValidationEnabled: () => true,
};

module.exports.validationPlugin = function (options) {
    options = _.extend({}, defaultOptions, options);
    if (_.isArray(options.validatorModels)) {
        // Combine list of validatorModels
        var validatorModels = _.toArray(options.validatorModels);
        validatorModels.unshift({});
        options.validatorModels = _.extend.apply(null, validatorModels);
    }
    return function (req, res, next) {
        var validationModel = req.route?.spec?.validation || req.route?.validation || undefined;

        if (validationModel && isValidationEnabled(req, res, next)) {
            // validate
            var errors = self.validation.process(validationModel, req, options);

            if (errors && (options.errorsAsArray && errors.length > 0) || (!options.errorsAsArray && _.keys(errors).length > 0)) {
                return self.error.handle(errors, req, res, options, next);
            }
        }

        next();
    };
};
