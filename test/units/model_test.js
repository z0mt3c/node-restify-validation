/*
 * The MIT License
 *
 * Copyright 2017 Stepan Riha.
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

describe('Model', function() {

    var validationReq;
    var timeStamp = new Date();

    beforeEach(function() {
        validationReq = {
            params: { num: '-123.5' },
            query: {
                flag: 'true',
                scores: ['1', '2', '100']
            },
            body: {
                from: timeStamp.toISOString(),
                to: timeStamp.valueOf(),
                ts: String(timeStamp.valueOf())
            }
        };
    });

    describe("not specified", function() {
        it ('should keep original value', function() {
            var validationModel = {
                resources: {
                    num: { isDecimal: true }
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            validationResult.length.should.equal(0);
            validationReq.params.num.should.equal('-123.5');
        });
    });

    describe("when validation fails", function() {
        it ('should keep original value', function() {
            var validationModel = {
                resources: {
                    num: { isNatural: true, model: Number }
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            validationResult.length.should.equal(1);
            validationReq.params.num.should.equal('-123.5');
        });
    });

    describe("when validation passes", function() {
        it ('should use model value', function() {
            function DateModel(value) {
                return new Date(Number(value) || value);
            }
            var validationModel = {
                resources: {
                    num: { model: Number }
                },
                queries: {
                    flag: { model: Boolean },
                    scores: {
                        isArray: {
                            element: { model: Number }
                        }
                    }
                },
                content: {
                    from: { model: DateModel },
                    to: { model: DateModel },
                    ts: { model: DateModel }
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            validationResult.length.should.equal(0);
            validationReq.params.num.should.equal(-123.5);
            validationReq.query.flag.should.equal(true);
            validationReq.query.scores.should.deepEqual([1, 2, 100]);
            validationReq.body.from.should.deepEqual(timeStamp);
            validationReq.body.to.should.deepEqual(timeStamp);
            validationReq.body.ts.should.deepEqual(timeStamp);
        });
    });

});
