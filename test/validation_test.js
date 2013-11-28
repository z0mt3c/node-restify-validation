/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var index = require('../lib/index');
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

            generationSpy.calledTwice.should.not.be.ok;
            generationSpy.calledOnce.should.be.ok;
            generationSpy.restore();

            done();
        });
    });

    describe('validate', function () {
        it('min', function (done) {
            var validationModel = { name: { isRequired: true, min: 10 } },
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
            var validationModel = { name: { isRequired: true, isIPv4: false } },
                validationReq = { params: { name: 9 } },
                validationOptions = {};

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            validationModel.name.isIPv4 = true;
            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(1);

            validationReq = { params: { name: '127.0.0.1' } };
            var errors2 = index.validation.process(validationModel, validationReq, validationOptions);
            errors2.length.should.equal(0);

            done();
        });

        it('example #1', function (done) {
            var validationModel = {
                status: { isRequired: true, isIn: ['foo', 'bar'], scope: 'query' },
                email: { isRequired: false, isEmail: true, scope: 'query' },
                age: { isRequired: true, isInt: true, scope: 'query' }
            };

            var validationReq = { params: {
                'name': 'Timo',
                'status': 'bar',
                'email': 'my.email@gmail.com',
                'age': '10',
                'street': 'abcdefghij'
            } };

            var validationOptions = {};

            var errors0 = index.validation.process(validationModel, validationReq, validationOptions);
            errors0.length.should.equal(0);

            delete validationReq.params.email;
            var errors1 = index.validation.process(validationModel, validationReq, validationOptions);
            errors1.length.should.equal(0);

            delete validationReq.params.status;
            var errors2 = index.validation.process(validationModel, validationReq, validationOptions);
            errors2.length.should.equal(1);

            done();
        });

        it('multiple parameters', function (done) {
            var validationModel = {
                brand: { isRequired: false, multiple: true, scope: 'query', regex: /^[0-9a-fA-F]{24}$/, description: 'Return products from these brands. Can be declared multiple times.' }
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
            var validationModel = {
                status: { isRequired: true, isIn: ['foo', 'bar'], scope: 'query' }
            };

            var errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: false });
            errors0.should.have.type('object');
            errors0.status.should.exist;
            errors0.status.field.should.equal('status');
            errors0.status.code.should.equal('MISSING');

            var errors1 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors1.should.be.an.instanceof(Array);
            errors1.length.should.equal(1);
            errors1[0].field.should.equal('status');
            errors1[0].code.should.equal('MISSING');

            done();
        });

        it('function as validation parameter', function (done) {
            var isRequiredTrue, validationReq = { params: { } };
            var options = { errorsAsArray: true };
            var validationModelTrue = { status: { } };

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

            validationModelTrue.status.isRequired = isRequiredTrue;
            validationModelTrue.status.isIn = ['foo', 'bar'];
            validationModelTrue.status.scope = 'query';

            var errors1 = index.validation.process(validationModelTrue, validationReq, options);
            errors1.should.be.an.instanceof(Array);
            errors1.length.should.equal(1);
            errors1[0].field.should.equal('status');
            errors1[0].code.should.equal('MISSING');

            done();
        });


        it('validation order', function (done) {
            var validationReq = { params: { } };
            var validationModel = {
                status: { isIn: ['foo', 'bar'], scope: 'query' }
            };

            validationModel.status.isRequired = false;
            var errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors0.should.be.an.instanceof(Array);
            errors0.length.should.equal(0);

            done();
        });

        it('validation equalTo', function (done) {
            var validationReq = { params: { } };
            var validationModel = {
                a: { isRequired: true },
                b: { equalTo: 'a' }
            };

            var errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors0.length.should.equal(1);
            errors0[0].field.should.equal('a');
            errors0[0].code.should.equal('MISSING');

            validationReq.params.a = 'abc';
            errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors0.length.should.equal(1);
            errors0[0].field.should.equal('b');
            errors0[0].code.should.equal('INVALID');

            validationReq.params.b = 'abc';
            errors0 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
            errors0.length.should.equal(0);

            done();
        });
    });
});
