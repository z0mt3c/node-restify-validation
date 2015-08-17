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
var assert = require('assert');

function parseErrorMessage(errors, template) {
  var compiled = _.template(template || '<%= field %> (<%= code %>): <%= message %>' );
  var key;
  var message = [];

  for (key in errors) {
    if (errors.hasOwnProperty(key)) {
      message.push(compiled({
        field: errors[key].field,
        code: errors[key].code,
        message: errors[key].message
      }));
    }
  }

  return message.join(', ');
}

module.exports.handle = function (errors, req, res, options, next) {
    if (options.handleError) {
        return options.handleError(res, errors);
    } else if (options.errorHandler) {
        return res.send(new options.errorHandler(parseErrorMessage(errors, options.template)));
    } else {
        return res.send (400, {
            status: 'validation failed',
            errors: errors
        });
    }
};
