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
var _ = require('lodash');
var index = require('../../lib/index');

describe('Model', function () {

    var validationReq;
    var timeStamp = new Date();

    beforeEach(function () {
        validationReq = {
            params: {num: '-123.5'},
            query: {
                flag: 'true',
                scores: ['1', '2', '100'],
                int: '123',
                decimal: '234.56'
            },
            body: {
                from: timeStamp.toISOString(),
                to: timeStamp.valueOf(),
                ts: String(timeStamp.valueOf()),
                dict: {
                    'First': 'January',
                    'Second': 'February',
                    'Third': 'March'
                }
            }
        };
    });

    describe('validatorModels', function () {
        var options = {
            validatorModels: index.validatorModels,
            errorsAsArray: true
        };

        _.forEach([
            // Configured validatorModels
            ['isBoolean', true, 'true', true],
            ['isDate', true, '2018-03-17', new Date('2018-03-17')],
            ['isDecimal', true, '123.45', 123.45],
            ['isDivisibleBy', 5, "10", 10],
            ['isFloat', true, '123.45', 123.45],
            ['isInt', true, '-12345', -12345],
            ['isNatural', true, '12345', 12345],
            // Without validatorModels
            ['contains', 'es', 'test'],
            ['equals', 'test', 'test'],
            ['is', 'test', 'test'],
            ['isAfter', '2018-03-17', '2018-03-18'],
            ['isAlpha', true, 'test'],
            ['isAlphanumeric', true, 'test123'],
            ['isBefore', '2018-03-17', '2018-03-16'],
            ['isCreditCard', true, '4012888888881881'],
            ['isEmail', true, 'bob@example.com'],
            ['isHexColor', true, '#aabbcc'],
            ['isHexadecimal', true, '01234567abcdef'],
            ['isIP', true, '127.0.0.1'],
            ['isIPNet', true, '127.0.0.1/27'],
            ['isIPv4', true, '127.0.0.1'],
            ['isIPv6', true, '2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
            ['isIn', ['test'], 'test'],
            ['isLowercase', true, 'test'],
            ['isNumeric', true, '12345'],
            ['isUUID', true, 'bf18cbf6-0cfd-4cc4-8625-a3a150c81e4b'],
            ['isUUIDv3', true, '6fa459ea-ee8a-3ca4-894e-db77e160355e'],
            ['isUUIDv4', true, '5d05b396-2ccf-4c6d-bf8b-844191aa3c1b'],
            ['isUppercase', true, 'TEST'],
            ['isUrl', true, 'http://example.com'],
            ['max', 10, '5'],
            ['min', 1, '5'],
            ['not', 'test', 'TEST'],
            ['notContains', 'se', 'test'],
            ['notIn', ['TEST'], 'test'],
            ['notRegex', /TEST/, 'test'],
            ['regex', /test/, 'test']

        ], function (test) {
            var validator = test[0],
                conf = test[1],
                value = test[2],
                expected = _.isUndefined(test[3]) ? value : test[3];
            var validatorDescription = ('{ ' + validator + ': ' + JSON.stringify(conf, function(key, val) {
                return (val instanceof RegExp) ? "REGEX:" + val.toString() : val;
            }) + ' }').replace(/\"REGEX:(\/.*\/)\"/, "$1");
            if (value === expected) {
                it(validatorDescription + ' keeps ' + JSON.stringify(value) + ' unchanged',
                    testValidator(validator, conf, value, expected));
            } else {
                it(validatorDescription + ' maps ' + JSON.stringify(value) + ' to ' + JSON.stringify(expected),
                    testValidator(validator, conf, value, expected));
            }
        });

        function testValidator(validator, conf, value, expected) {
            return function () {
                var validationModel = {
                    queries: {
                        value: {}
                    }
                };
                validationModel.queries.value[validator] = conf;
                var req = {
                    query: {value: value}
                };
                var validationResult = index.validation.process(validationModel, req, options);
                validationResult.length.should.equal(0);
                req.query.value.should.deepEqual(expected);
            }
        }
    });

    describe('option: validatorModels object', function () {
        var validationPlugin = index.validationPlugin({
            errorsAsArray: true,
            validatorModels: {
                isDecimal: Number,
                isBoolean: function (val) {
                    return val === 'true';
                }
            }
        });

        var validationModel = {
            queries: {
                decimal: {isDecimal: true},
                flag: {isBoolean: true},
                int: {isInt: true}
            }
        };

        it('should apply validatorModels', function () {
            validationReq.route = {
                validation: validationModel
            };
            validationPlugin(validationReq, {}, function () {
                validationReq.query.decimal.should.equal(234.56);
                validationReq.query.flag.should.equal(true);
                validationReq.query.int.should.equal('123');
            });
        });
    });

    describe('option: validatorModels array', function () {
        var validationPlugin = index.validationPlugin({
            errorsAsArray: true,
            validatorModels: [{
                isDecimal: Number
            }, {
                isBoolean: function (val) {
                    return val === 'true';
                }
            }]
        });

        var validationModel = {
            queries: {
                decimal: {isDecimal: true},
                flag: {isBoolean: true},
                int: {isInt: true}
            }
        };

        it('should apply validatorModels', function () {
            validationReq.route = {
                validation: validationModel
            };
            validationPlugin(validationReq, {}, function () {
                validationReq.query.decimal.should.equal(234.56);
                validationReq.query.flag.should.equal(true);
                validationReq.query.int.should.equal('123');
            });
        });
    });

    describe("not specified", function () {
        it('if no validatorModels, should keep original value', function () {
            var validationModel = {
                resources: {
                    num: {isDecimal: true}
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
            validationResult.length.should.equal(0);
            validationReq.params.num.should.equal('-123.5');
        });

        it('if validatorModels, should use model', function () {
            var validationModel = {
                resources: {
                    num: {isDecimal: true}
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, {
                errorsAsArray: true,
                validatorModels: {isDecimal: Number}
            });
            validationResult.length.should.equal(0);
            validationReq.params.num.should.equal(-123.5);
        });
    });

    describe("when validation fails", function () {
        it('should keep original value', function () {
            var validationModel = {
                resources: {
                    num: {isNatural: true, model: Number}
                }
            };

            var validationResult = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
            validationResult.length.should.equal(1);
            validationReq.params.num.should.equal('-123.5');
        });
    });

    describe("when validation passes", function () {
        it('should use model value', function () {
            function DateModel(value) {
                return new Date(Number(value) || value);
            }

            var validationModel = {
                resources: {
                    num: {model: Number, isFloat: true}
                },
                queries: {
                    flag: {model: Boolean},
                    scores: {
                        isArray: {
                            element: {model: Number}
                        }
                    }
                },
                content: {
                    from: {model: DateModel},
                    to: {model: DateModel},
                    ts: {model: DateModel},
                    dict: {
                        isDictionary: {
                            key: { model: function(s) { return s.toLowerCase(); }},
                            value: { model: function(s) { return s.toUpperCase(); }}
                        }
                    }
                }
            };

            // Keys should become lower case
            var expectedDictionaryKeys = _.map(_.keys(validationReq.body.dict), function(s) { return s.toLowerCase(); });
            // Values should become upper case
            var expectedDictionaryValues = _.map(_.values(validationReq.body.dict), function(s) { return s.toUpperCase(); });

            var validationResult = index.validation.process(validationModel, validationReq, {
                errorsAsArray: true,
                validatorModels: {
                    isFloat: function () {
                        throw new Error("Should not be called");
                    }
                }
            });
            validationResult.length.should.equal(0);
            validationReq.params.num.should.equal(-123.5);
            validationReq.query.flag.should.equal(true);
            validationReq.query.scores.should.deepEqual([1, 2, 100]);
            validationReq.body.from.should.deepEqual(timeStamp);
            validationReq.body.to.should.deepEqual(timeStamp);
            validationReq.body.ts.should.deepEqual(timeStamp);
            _.keys(validationReq.body.dict).should.deepEqual(expectedDictionaryKeys);
            _.values(validationReq.body.dict).should.deepEqual(expectedDictionaryValues);
        });
    });

});
