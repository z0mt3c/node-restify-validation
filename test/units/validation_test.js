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
var _ = require('lodash');
var sinon = require('sinon');

var options = {};
var req = {};
var testFunction1 = function () {
    return true;
};
var testFunction2 = function () {
    return false;
};
var myIgnoredTextKey = 'myIgnoredTestKey';
var myTestRequest = { route: { name: myIgnoredTextKey }};

describe('Validation', function () {
    describe('getValidatorChain', function () {
        before(function () {
            index.validation._validators.myTestValidator = testFunction1;
            index.validation._validators.myTestValidator2 = testFunction2;
            index.validation._ignoredValidationKeys.push(myIgnoredTextKey);
        });

        after(function () {
            delete index.validation._validators.myTestValidator;
            delete index.validation._validators.myTestValidator2;
            index.validation._ignoredValidationKeys.splice(index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey), 1);
            index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey).should.equal(-1);
        });

        it('ignore validator key', function () {
            index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey).should.not.equal(-1);
            var validatorChainAsObject = index.validation.getValidatorChain(null, { myIgnoredTextKey: testFunction1 }, null, null, null);
            validatorChainAsObject.length.should.equal(0);
        });

        it('single validator', function (done) {
            var validatorChainAsObject = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 }, null, null, null);
            validatorChainAsObject.length.should.equal(1);
            validatorChainAsObject[0].fn.should.equal(testFunction1);
            validatorChainAsObject[0].msg.should.equal(testFunction1);

            var validatorChainAsArray = index.validation.getValidatorChain(null, [
                { myTestValidator: true, msg: testFunction1 }
            ], null, null, null);
            validatorChainAsArray.length.should.equal(1);
            validatorChainAsArray[0].fn.should.equal(testFunction1);
            validatorChainAsArray[0].msg.should.equal(testFunction1);

            done();
        });

        it('multiple validators', function (done) {
            var validatorChainAsObject = index.validation.getValidatorChain(null, { myTestValidator: true, myTestValidator2: true, msg: myIgnoredTextKey }, null, null, null);
            validatorChainAsObject.length.should.equal(2);

            validatorChainAsObject[0].fn.should.equal(testFunction1);
            validatorChainAsObject[0].msg.should.equal(myIgnoredTextKey);
            validatorChainAsObject[1].fn.should.equal(testFunction2);
            validatorChainAsObject[1].msg.should.equal(myIgnoredTextKey);

            var validatorChainAsArray = index.validation.getValidatorChain(null, [
                { myTestValidator: true, msg: testFunction1 },
                { myTestValidator2: true, msg: false }
            ], null, null, null);
            validatorChainAsArray.length.should.equal(2);
            validatorChainAsArray[0].fn.should.equal(testFunction1);
            validatorChainAsArray[0].msg.should.equal(testFunction1);
            validatorChainAsArray[1].fn.should.equal(testFunction2);
            validatorChainAsArray[1].msg.should.equal(false);

            var validatorChainAsArray2 = index.validation.getValidatorChain(null, [
                { myTestValidator: true, msg: testFunction1 },
                { myTestValidator2: true, myTestValidator: true, msg: false }
            ], null, null, null);
            validatorChainAsArray2.length.should.equal(3);
            validatorChainAsArray2[0].fn.should.equal(testFunction1);
            validatorChainAsArray2[0].msg.should.equal(testFunction1);
            validatorChainAsArray2[1].fn.should.equal(testFunction2);
            validatorChainAsArray2[1].msg.should.equal(false);
            validatorChainAsArray2[2].fn.should.equal(testFunction1);
            validatorChainAsArray2[2].msg.should.equal(false);

            done();
        });

        it('validationChainStore by routeName', function (done) {
            var generationSpy = sinon.spy(index.validation, '_generateValidationChain');

            var validatorChainAsObject = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 }, null, null, myTestRequest, null);
            validatorChainAsObject.length.should.equal(1);
            validatorChainAsObject[0].fn.should.equal(testFunction1);
            validatorChainAsObject[0].msg.should.equal(testFunction1);

            var validatorChainAsObject2 = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 }, null, null, myTestRequest, null);
            validatorChainAsObject2.length.should.equal(1);
            validatorChainAsObject2[0].fn.should.equal(testFunction1);
            validatorChainAsObject2[0].msg.should.equal(testFunction1);

            generationSpy.calledTwice.should.not.be.ok();
            generationSpy.calledOnce.should.be.ok();
            generationSpy.restore();

            done();
        });
    });

    describe('validate', function () {
        it('min', function (done) {
            var validationModel = { resources: { name: { isRequired: true, min: 10 } } },
                validationReq = { params: { name: 9 } },
                validationOptions = {};

            var errors = index.validation.process(validationModel, validationReq, validationOptions);
            errors.length.should.equal(1);

            validationReq = { params: { name: 10 } };

            var errors2 = index.validation.process(validationModel, validationReq, validationOptions);
            errors2.length.should.equal(0);

            done();
        });

        it('isIPv4', function (done) {
            var validationModel = { resources: { name: { isRequired: true, isIPv4: false } } },
                validationReq = { params: { name: 9 } },
                validationOptions = { };

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            validationModel.resources.name.isIPv4 = true;
            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(1);

            validationReq = { params: { name: '127.0.0.1' } };
            var errors2 = index.validation.process(validationModel, validationReq, validationOptions);
            errors2.length.should.equal(0);

            done();
        });

        it('in body scope', function (done) {
            var validationModel = { content: { name: { isRequired: true, isIPv4: false } } },
                validationReq = { body: { name: 9 } },
                validationOptions = { };

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            validationReq = { params: { name: 9 } };

            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(1);

            done();
        });

        it('example #1', function (done) {
            var validationModel = {
                queries: {
                    status: { isRequired: true, isIn: ['foo', 'bar'] },
                    email: { isRequired: false, isEmail: true },
                    age: { isRequired: true, isInt: true }
                }
            };

            var validationReq = { query: {
                'name': 'Timo',
                'status': 'bar',
                'email': 'my.email@gmail.com',
                'age': '10',
                'street': 'abcdefghij'
            } };

            var validationOptions = {};

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            delete validationReq.query.email;
            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(0);

            delete validationReq.query.status;
            var errors2 = index.validation.process(validationModel, validationReq, validationOptions);
            errors2.length.should.equal(1);

            done();
        });

        it('multiple parameters', function (done) {
            var validationModel = { resources: {
                    brand: { isRequired: false, multiple: true, regex: /^[0-9a-fA-F]{24}$/, description: 'Return products from these brands. Can be declared multiple times.' }
                }
            };

            var validationReq = {
                params: {
                    'brand': ['52249dcf5fea540000000004', '5224a2038cc1b0040200000f']
                }
            };

            var validationOptions = {};

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            validationReq.params.brand.push('asdf');
            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(1);

            done();
        });


        it('errorsAsArray / errorsAsObject', function (done) {
            var validationReq = { params: { } };
            var validationModel = { resources: {
                    testParam: { isRequired: true, isIn: ['foo', 'bar']}
                }
            };

            var objectRes = index.validation.process(validationModel, validationReq, { errorsAsArray: false });
            objectRes.should.have.type('object');
            objectRes.testParam.reason.should.equal('Field is required');
            objectRes.testParam.type.should.equal('MISSING');

            var arrayRes = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            arrayRes.should.be.an.instanceof(Array);
            arrayRes.length.should.equal(1);
            arrayRes[0].reason.should.equal('Field is required');
            arrayRes[0].type.should.equal('MISSING');

            done();
        });

        it('forbidUndefinedVariables', function (done) {
            var validationReq = { params: { foo: "foo", bar: "bar" } };
            var validationModel = { resources: {
                    foo: { isRequired: true, isIn: ['foo', 'bar'] }
                }
            };

            var validRes = index.validation.process(validationModel, validationReq, { errorsAsArray: false, forbidUndefinedVariables: false });
            validRes.should.be.empty;

            var invalidRes = index.validation.process(validationModel, validationReq, { errorsAsArray: true, forbidUndefinedVariables: true });
            invalidRes.should.be.an.instanceof(Array);
            invalidRes.length.should.equal(1);
            invalidRes[0].reason.should.equal('Variable is not present');
            invalidRes[0].type.should.equal('UNDEFINED');

            done();
        });

        it('function as validation parameter', function (done) {
            var isRequiredTrue, validationReq = { params: { } };
            var options = { errorsAsArray: true };
            var validationModelTrue = { resources: { status: { } } };

            isRequiredTrue = function () {
                this.req.should.exist;
                this.req.should.equal(validationReq);

                this.validationModel.should.exist;
                this.validationModel.should.equal(validationModelTrue);

                this.validationRules.should.exist;
                this.validationRules.should.equal(validationModelTrue.status);

                this.options.should.exist;
                this.options.should.equal(options);

                return true;
            };

            validationModelTrue.resources.status.isRequired = isRequiredTrue;
            validationModelTrue.resources.status.isIn = ['foo', 'bar'];

            var validationRes = index.validation.process(validationModelTrue, validationReq, options);
            validationRes.should.be.an.instanceof(Array);
            validationRes.length.should.equal(1);
            validationRes[0].reason.should.equal('Field is required');
            validationRes[0].type.should.equal('MISSING');

            done();
        });


        it('validation order', function (done) {
            var validationReq = { params: { } };
            var validationModel = { resources: {
                    status: { isIn: ['foo', 'bar'] }
                }
            };

            validationModel.resources.status.isRequired = false;
            var errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors0.should.be.an.instanceof(Array);
            errors0.length.should.equal(0);

            done();
        });

        it('validation equalTo', function (done) {
            var validationReq = { params: { } };
            var validationModel = { resources: {
                    a: { isRequired: true },
                    b: { equalTo: 'a' }
                }
            };

            var checkMissing = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            checkMissing.length.should.equal(1);
            checkMissing[0].reason.should.equal('Field is required');
            checkMissing[0].type.should.equal('MISSING');

            validationReq.params.a = 'abc';
            var checkInvalid = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            checkInvalid.length.should.equal(1);
            checkInvalid[0].reason.should.equal('Needs to equal (THE OTHER FIELD)');
            checkInvalid[0].type.should.equal('INVALID');

            validationReq.params.b = 'abc';
            var checkValid = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            checkValid.length.should.equal(0);

            done();
        });

        describe('isArray', function() {
            var validationReq;

            beforeEach(function() {
                validationReq = {
                    body: {
                        numArr: [1, 2, 34],
                        numArrNull: [1, 2, null, 34],
                        strVal: "I'm just a string"
                    }
                };
            });

            it('accept array when true', function () {
                var validationModel = {
                    content: {
                        numArrNull: {isArray: true}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(0);
            });

            it('reject non-array when true', function () {
                var validationModel = {
                    content: {
                        strVal: {isArray: true}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(1);
                checkInvalid[0].reason.should.equal('Field is not array');
                checkInvalid[0].type.should.equal('INVALID');
            });

            it('reject array when false', function () {
                var validationModel = {
                    content: {
                        numArr: {isArray: false}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(1);
                checkInvalid[0].reason.should.equal('Field is an array');
                checkInvalid[0].type.should.equal('INVALID');
            });

            it('validate minLength', function () {
                var validationModel = {
                    content: {
                        numArr: {isArray: {}}
                    }
                };

                validationModel.content.numArr.isArray.minLength = 1;
                var checkInvalidLength = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalidLength.length.should.equal(0);

                validationModel.content.numArr.isArray.minLength = 5;
                var checkTooShorts = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkTooShorts.length.should.equal(1);
                checkTooShorts[0].reason.should.equal('Not enough elements');
                checkTooShorts[0].type.should.equal('INVALID');

                delete validationReq.body.numArr;
                var checkMissing = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkMissing.length.should.equal(0);
            });

            it('validate maxLength', function () {
                var validationModel = {
                    content: {
                        numArr: {isArray: {}}
                    }
                };

                validationModel.content.numArr.isArray.maxLength = 10;
                var checkInvalidValidLength = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkInvalidValidLength.length.should.equal(0);

                validationModel.content.numArr.isArray.maxLength = 2;
                var checkTooLong = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkTooLong.length.should.equal(1);
                checkTooLong[0].reason.should.equal('Too many elements');
                checkTooLong[0].type.should.equal('INVALID');

                delete validationReq.body.numArr;
                var checkMissing = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkMissing.length.should.equal(0);
            });

            it('validate array elements', function () {
                var validationReq = {
                    body: {
                        numbers: [1, 5, 67],
                        numbersInvalid: [1, 5, "a", 67, "b"],
                        numbersAndNull: [1, 5, null, 67]
                    }
                };

                var checkInvalidNumbersInvalid = index.validation.process({
                    content: {
                        numbersInvalid: {
                            isArray: {
                                element: {
                                    isInt: true
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkInvalidNumbersInvalid.length.should.equal(1);
                checkInvalidNumbersInvalid[0].reason.should.equal('Invalid integer');
                checkInvalidNumbersInvalid[0].type.should.equal('INVALID');
                checkInvalidNumbersInvalid[0].field.should.equal('numbersInvalid[2]');

                var checkInvalidNumbersAndNulls = index.validation.process({
                    content: {
                        numbersAndNull: {
                            isArray: {
                                element: {
                                    isInt: true
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkInvalidNumbersAndNulls.length.should.equal(1);
                checkInvalidNumbersAndNulls[0].reason.should.equal('Invalid integer');
                checkInvalidNumbersAndNulls[0].type.should.equal('INVALID');
                checkInvalidNumbersAndNulls[0].field.should.equal('numbersAndNull[2]');
            });

        });

        describe('isDictionary', function() {
            var validationReq;

            beforeEach(function() {
                validationReq = {
                    body: {
                        numDict: {
                            a: 1,
                            b: 2,
                            c: 34
                        },
                        numDictNull: {
                            a: 1,
                            b: 2,
                            c: null,
                            d: 34
                        },
                        numArr: [1, 2, 34],
                        numArrNull: [1, 2, null, 34],
                        strVal: "I'm just a string"
                    }
                };
            });

            it('accept object when true', function () {
                var validationModel = {
                    content: {
                        numDictNull: {isDictionary: true}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(0);
            });

            it('reject non-object when true', function () {
                var validationModel = {
                    content: {
                        strVal: {isDictionary: true}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(1);
                checkInvalid[0].reason.should.equal('Field is not object');
                checkInvalid[0].type.should.equal('INVALID');
            });

            it('reject object when false', function () {
                var validationModel = {
                    content: {
                        numDict: {isDictionary: false}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(1);
                checkInvalid[0].reason.should.equal('Field is an object');
                checkInvalid[0].type.should.equal('INVALID');
            });

            it('validate minLength', function () {
                var validationModel = {
                    content: {
                        numDict: {isDictionary: {}}
                    }
                };

                validationModel.content.numDict.isDictionary.minLength = 1;
                var checkInvalidLength = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalidLength.length.should.equal(0);

                validationModel.content.numDict.isDictionary.minLength = 5;
                var checkTooShorts = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkTooShorts.length.should.equal(1);
                checkTooShorts[0].reason.should.equal('Not enough elements');
                checkTooShorts[0].type.should.equal('INVALID');

                delete validationReq.body.numDict;
                var checkMissing = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkMissing.length.should.equal(0);
            });

            it('validate maxLength', function () {
                var validationModel = {
                    content: {
                        numDict: {isDictionary: {}}
                    }
                };

                validationModel.content.numDict.isDictionary.maxLength = 10;
                var checkInvalidValidLength = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkInvalidValidLength.length.should.equal(0);

                validationModel.content.numDict.isDictionary.maxLength = 2;
                var checkTooLong = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkTooLong.length.should.equal(1);
                checkTooLong[0].reason.should.equal('Too many elements');
                checkTooLong[0].type.should.equal('INVALID');

                delete validationReq.body.numDict;
                var checkMissing = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
                checkMissing.length.should.equal(0);
            });

            it('validate dictionary keys', function () {
                var validationReq = {
                    body: {
                        letters: { a: 1, b: 2, c: 3, d: 4 },
                        vowels: { a: 1, e: 2, i: 3 }
                    }
                };

                var checkValidKeys = index.validation.process({
                    content: {
                        vowels: {
                            isDictionary: {
                                key: {
                                    isIn: ['a', 'e', 'i', 'o', 'u']
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkValidKeys.length.should.equal(0);

                var checkInvalidKeysInvalid = index.validation.process({
                    content: {
                        letters: {
                            isDictionary: {
                                key: {
                                    isIn: ['a', 'e', 'i', 'o', 'u']
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkInvalidKeysInvalid.length.should.equal(1);
                checkInvalidKeysInvalid[0].reason.should.equal('Unexpected value or invalid argument');
                checkInvalidKeysInvalid[0].type.should.equal('INVALID');
                checkInvalidKeysInvalid[0].field.should.equal('letters(key:"b")');
            });

            it('validate dictionary values', function () {
                var validationReq = {
                    body: {
                        numbers: { a: 1, b: 5, c: 67 },
                        numbersInvalid: { a: 1, b: 5, c: "a", d: 67, e: "b" },
                        numbersAndNull: { a: 1, b: 5, c: null, d: 67 }
                    }
                };

                var checkInvalidNumbersInvalid = index.validation.process({
                    content: {
                        numbersInvalid: {
                            isDictionary: {
                                value: {
                                    isInt: true
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkInvalidNumbersInvalid.length.should.equal(1);
                checkInvalidNumbersInvalid[0].reason.should.equal('Invalid integer');
                checkInvalidNumbersInvalid[0].type.should.equal('INVALID');
                checkInvalidNumbersInvalid[0].field.should.equal('numbersInvalid["c"]');

                var checkInvalidNumbersAndNulls = index.validation.process({
                    content: {
                        numbersAndNull: {
                            isDictionary: {
                                value: {
                                    isInt: true
                                }
                            }
                        }
                    }
                }, validationReq, {errorsAsArray: true});
                checkInvalidNumbersAndNulls.length.should.equal(1);
                checkInvalidNumbersAndNulls[0].reason.should.equal('Invalid integer');
                checkInvalidNumbersAndNulls[0].type.should.equal('INVALID');
                checkInvalidNumbersAndNulls[0].field.should.equal('numbersAndNull["c"]');
            });

        });

        describe('isObject', function () {
            var validationReq = {
                body: {
                    person: {
                        name: "Bob",
                        age: 50,
                        preferences: {
                            favoriteNumber: -333
                        }
                    },
                    strVal: "I'm just a string",
                    arrVal: [123, "bob"]
                }
            };

            it('accept object when true', function () {
                var validationModel = {
                    content: {
                        person: {isObject: true}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(0);
            });

            it('reject non-object when true', function () {
                var checkInvalidString = index.validation.process({content: {strVal: {isObject: true}}}, validationReq, {errorsAsArray: true});
                checkInvalidString.length.should.equal(1);
                checkInvalidString[0].reason.should.equal('Field is not object');
                checkInvalidString[0].type.should.equal('INVALID');
                checkInvalidString[0].field.should.equal('strVal');

                var checkInvalidArray = index.validation.process({content: {arrVal: {isObject: true}}}, validationReq, {errorsAsArray: true});
                checkInvalidArray.length.should.equal(1);
                checkInvalidArray[0].reason.should.equal('Field is not object');
                checkInvalidArray[0].type.should.equal('INVALID');
                checkInvalidArray[0].field.should.equal('arrVal');
            });

            it('reject object when false', function () {
                var validationModel = {
                    content: {
                        person: {isObject: false}
                    }
                };
                var checkInvalid = index.validation.process(validationModel, validationReq, {errorsAsArray: true});
                checkInvalid.length.should.equal(1);
                checkInvalid[0].reason.should.equal('Field is an object');
                checkInvalid[0].type.should.equal('INVALID');
            });

            it('validate properties', function () {
                var validationModel = {
                    content: {
                        person: {
                            isRequired: true,
                            isObject: {
                                properties: {
                                    name: {
                                        isRequired: true
                                    },
                                    age: {
                                        isRequired: true,
                                        isNatural: true
                                    },
                                    preferences: {
                                        isObject: {
                                            properties: {
                                                favoriteNumber: {
                                                    isRequired: true,
                                                    isInt: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                var tests = [{
                    prepare: function (request) {
                        delete request.body.person;
                    },
                    expected: {type: 'MISSING', field: 'person'}
                }, {
                    prepare: function (request) {
                        delete request.body.person.name;
                    },
                    expected: {type: 'MISSING', field: 'person.name'}
                }, {
                    prepare: function (request) {
                        delete request.body.person.age;
                    },
                    expected: {type: 'MISSING', field: 'person.age'}
                }, {
                    prepare: function (request) {
                        request.body.person.age = -5;
                    },
                    expected: {type: 'INVALID', field: 'person.age'}
                }, {
                    prepare: function (request) {
                        request.body.person.preferences.favoriteNumber = "not a number";
                    },
                    expected: {type: 'INVALID', field: 'person.preferences.favoriteNumber'}
                }];

                _.forEach(tests, function (test) {
                    var request = JSON.parse(JSON.stringify(validationReq));
                    test.prepare(request);

                    var checkInvalid = index.validation.process(validationModel, request, {errorsAsArray: true});
                    checkInvalid.length.should.equal(1);
                    checkInvalid[0].type.should.equal(test.expected.type);
                    checkInvalid[0].field.should.equal(test.expected.field);
                });
            });

        });
    });
});

it('node-validator error messages', function() {
  var validationReq = { params: {
    ip:    '123',
    isbn:  '123',
    isbn2: '123'
  } };
  var validationModel = { resources: {
    ip:    { isRequired: true, isIP: true },
    isbn:  { isRequired: true, isISBN: true, msg: 'Invalid ISBN' },
    isbn2: { isRequired: true, isISBN: true },
  } };
  var options = { errorsAsArray: true };

  var errors = index.validation.process(validationModel, validationReq, options);
  errors.length.should.equal(3);
  'Invalid IP'.should.equal(errors[0].reason);
  'Invalid ISBN'.should.equal(errors[1].reason);
  'Invalid value'.should.equal(errors[2].reason);
});
