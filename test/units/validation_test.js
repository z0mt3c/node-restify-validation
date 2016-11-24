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
