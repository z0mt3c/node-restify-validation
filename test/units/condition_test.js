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
var index = require('../../lib/index');

describe('Conditions', function () {
    it('exists', function(done) {
        var validationReq = { params: { a: 'fdsa' } };
        var validationModel = {
            resources: {
                a: { exists: true},
                b: { isRequired: index.when.exists({variable: 'a'}) }
            }
        };

        var missingErrors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        missingErrors.length.should.equal(1);
        missingErrors[0].type.should.equal('MISSING');

        validationReq.params.b = 'test';
        var presentErrors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        presentErrors.length.should.equal(0);

        validationReq.params = {};
        var notRequiredErrors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        notRequiredErrors.length.should.equal(0);

        done();
    });

    it('paramMatches', function (done) {
        var validationReq = { params: { a: 'fdsa' } };
        var validationModel = {
            resources: {
                a: { isRequired: false },
                b: { isRequired: index.when.paramMatches({ variable: 'a', matches: ['asdf','fdsa']}) }
            }
        };

        var errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(1);
        errors[0].type.should.equal('MISSING');

        validationModel = {
            resources: {
                a: { isRequired: false },
                b: { isRequired: index.when.paramMatches({ variable: 'a', matches: ['fdsa']}) }
            }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(1);
        errors[0].type.should.equal('MISSING');

        validationModel = {
            resources: {
                a: { isRequired: false },
                b: { isRequired: index.when.paramMatches({ variable: 'a', matches: ['asdf']}) }
            }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(0);

        validationReq.query = {a: 'test'};
        validationModel = {
            resources: {
                a: { isRequired: true }
            },
            queries: {
                a: { isRequired: index.when.paramMatches({scope: 'resources', variable: 'a', matches: ['fdsa']}) }
            }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(0);

        done();
    });
});
