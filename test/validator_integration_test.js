var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var _ = require('underscore');
var index = require('../index');


var test = function (validatorName, validatorValue, correctValue, incorrectValue, done) {
    var validationReq = { params: { } };
    var validationModel = { myParameter: { isRequired: true, scope: 'query' } };
    var options = { errorsAsArray: true };

    validationModel.myParameter[validatorName] = validatorValue;
    var errors0 = index.validation.process(validationModel, validationReq, options);
    errors0.length.should.equal(1);
    errors0[0].should.exist;
    errors0[0].field.should.equal('myParameter');
    errors0[0].code.should.equal('MISSING');

    if (!_.isArray(correctValue)) {
        correctValue = [correctValue];
    }
    _.each(correctValue, function(value) {
        validationReq.params.myParameter = value;
        var errors1 = index.validation.process(validationModel, validationReq, options);
        errors1.length.should.equal(0);
    });

    if (!_.isArray(incorrectValue)) {
        incorrectValue = [incorrectValue];
    }

    _.each(incorrectValue, function(value) {
        validationReq.params.myParameter = value;
        var errors2 = index.validation.process(validationModel, validationReq, options);
        errors2.length.should.equal(1);
        errors2[0].field.should.equal('myParameter');
        errors2[0].code.should.equal('INVALID');
    });

    done();
};

describe('Integration test', function () {
    it('equals', function (done) {
        test('equals', 'foobar', 'foobar', 'foobar2', done);
    });
});
