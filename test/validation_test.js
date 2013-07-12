var index = require('../index');
var sinon = require('sinon');

var options = {};
var req = {};
var testFunction1 = function () { return true; };
var testFunction2 = function () { return false; };
var myIgnoredTextKey = 'myIgnoredTestKey';
var myTestRequest = { route: { name: myIgnoredTextKey }};

describe('Validation', function () {
    describe('getValidatorChain', function () {
        before(function() {
            index.validation._validators.myTestValidator = testFunction1;
            index.validation._validators.myTestValidator2 = testFunction2;
            index.validation._ignoredValidationKeys.push(myIgnoredTextKey);
        });

        after(function() {
            delete index.validation._validators.myTestValidator;
            delete index.validation._validators.myTestValidator2;
            index.validation._ignoredValidationKeys.splice(index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey), 1);
            index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey).should.equal(-1);
        });

        it('ignore validator key', function () {
            index.validation._ignoredValidationKeys.indexOf(myIgnoredTextKey).should.not.equal(-1);
            var validatorChainAsObject = index.validation.getValidatorChain(null, { myIgnoredTextKey: testFunction1 }, null, null, null);
            console.log(validatorChainAsObject);
            validatorChainAsObject.length.should.equal(0);
        });

        it('single validator', function (done) {
            var validatorChainAsObject = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 }, null, null, null);
            validatorChainAsObject.length.should.equal(1);
            validatorChainAsObject[0].fn.should.equal(testFunction1);
            validatorChainAsObject[0].msg.should.equal(testFunction1);

            var validatorChainAsArray = index.validation.getValidatorChain(null, [{ myTestValidator: true, msg: testFunction1 }], null, null, null);
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

            var validatorChainAsArray = index.validation.getValidatorChain(null, [{ myTestValidator: true, msg: testFunction1 }, { myTestValidator2: true, msg: false }], null, null, null);
            validatorChainAsArray.length.should.equal(2);
            validatorChainAsArray[0].fn.should.equal(testFunction1);
            validatorChainAsArray[0].msg.should.equal(testFunction1);
            validatorChainAsArray[1].fn.should.equal(testFunction2);
            validatorChainAsArray[1].msg.should.equal(false);

            var validatorChainAsArray2 = index.validation.getValidatorChain(null, [{ myTestValidator: true, msg: testFunction1 }, { myTestValidator2: true, myTestValidator: true, msg: false }], null, null, null);
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

            var validatorChainAsObject = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 },  null, myTestRequest, null);
            validatorChainAsObject.length.should.equal(1);
            validatorChainAsObject[0].fn.should.equal(testFunction1);
            validatorChainAsObject[0].msg.should.equal(testFunction1);

            var validatorChainAsObject2 = index.validation.getValidatorChain(null, { myTestValidator: true, msg: testFunction1 },  null, myTestRequest, null);
            validatorChainAsObject2.length.should.equal(1);
            validatorChainAsObject2[0].fn.should.equal(testFunction1);
            validatorChainAsObject2[0].msg.should.equal(testFunction1);

            generationSpy.calledTwice.should.not.be.ok;
            generationSpy.calledOnce.should.be.ok;
            generationSpy.restore();

            done();
        });
    });
});
