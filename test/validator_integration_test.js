/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var index = require('../lib/index');


var test = function (validatorName, validatorValue, correctValue, incorrectValue) {
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
};

describe('Validators', function () {
    it('node-validator isEmail', function () {
        test('isEmail', true, 'test@email.de', 'asdfasdf.de');
    });
    it('node-validator isUrl', function () {
        test('isUrl', true, 'http://www.google.de', 'asdfasdf');
    });
    it('node-validator isIP', function () {
        test('isIP', true, '127.0.0.1', 'asdf');
    });
    it('node-validator isIPv4', function () {
        test('isIPv4', true, '127.0.0.1', 'asdf');
    });
    it('node-validator isIPv6', function () {
        test('isIPv6', true, '2001:0db8:85a3:08d3:1319:8a2e:0370:7344', 'asdf');
    });
    it('node-validator isAlpha', function () {
        test('isAlpha', true, 'abc', 'a1');
    });
    it('node-validator isAlphanumeric', function () {
        test('isAlphanumeric', true, 'a1', 'a1!');
    });
    it('node-validator isNumeric', function () {
        test('isNumeric', true, '1', 'asd');
    });
    it('node-validator isHexadecimal', function () {
        test('isHexadecimal', true, 'df', 'w');
    });
    it('node-validator isHexColor', function () {
        test('isHexColor', true, ['#000000', 'ffffff'], '#aaaaaaaasdf');
    });
    it('node-validator isInt', function () {
        test('isInt', true, '123', 'a1');
    });
    it('node-validator isLowercase', function () {
        test('isLowercase', true, 'abc', 'aBc');
    });
    it('node-validator isUppercase', function () {
        test('isUppercase', true, 'ABC', 'ABc');
    });
    it('node-validator isDecimal', function () {
        test('isDecimal', true, '0.5', '0,5');
    });
    it('node-validator isFloat', function () {
        test('isFloat', true, '0.5', '0,5');
    });
    it('node-validator equals', function () {
        test('equals', 'foobar', 'foobar', 'foobar2');
    });
    it('node-validator contains', function () {
        test('contains', 'foo', 'foobar', 'bar');
    });
    it('node-validator notContains', function () {
        test('notContains', 'bar', 'foo', 'barbar');
    });

        // not supported:
        //test('notNull', true, '0.5', ' ');
        //test('isNull', true, '0.5', ' ');
        //test('notEmpty', true, '0.5', '     ');
        //test('len', [3,5], 'aaaa', ['aa','dddddd']);

    it('node-validator is', function () {
        test('is', /^abc$/, 'abc', 'aac');
    });
    it('node-validator regexp', function () {
        test('regex', /^abc$/, 'abc', 'aac');
    });
    it('node-validator notRegex', function () {
        test('notRegex', /^abc$/, 'acc', 'abc');
    });
    it('node-validator not', function () {
        test('not', /^abc$/, 'acc', 'abc');
    });

    it('node-validator isIn', function () {
        test('isIn', ['a','bc'], ['a','bc'], 'c');
    });
    it('node-validator notIn', function () {
        test('notIn', ['a','bc'], 'c', ['a','bc']);
    });
    it('node-validator max', function () {
        test('max', 5, [1,'2',5], [6,'7']);
    });
    it('node-validator min', function () {
        test('min', 5, [5, 6,'7'], [1,'2']);
    });
    it('node-validator isCreditCard', function () {
        test('isCreditCard', true, [], 'adua8suzd8azs7dadsdad');
    });
    it('node-validator isUUID', function () {
        test('isUUID', true, 'A987FBC9-4BED-3078-CF07-9141BA07C9F3', 'abc');
    });
    it('node-validator isUUIDv3', function () {
        test('isUUIDv3', true, '987FBC97-4BED-3078-AF07-9141BA07C9F3', 'abc');
    });
    it('node-validator isUUIDv4', function () {
        test('isUUIDv4', true, '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1', 'abc');
    });
    it('node-validator isUUIDv5', function () {
        test('isUUIDv5', true, '987FBC97-4BED-5078-AF07-9141BA07C9F3', 'abc');
    });
    it('node-validator isDate', function () {
        test('isDate', true, '2011-08-04', '20110804');
    });
    it('node-validator isBefore', function () {
        test('isBefore', '2011-08-04', '2011-08-03', '2011-08-04');
    });
    it('node-validator isAfter', function () {
        test('isAfter', '2011-08-04', '2011-08-05', '2011-08-04');
    });

    it('node-validator arrays', function() {
        test('isInt', true, '123', [['456', '0.123']]);
    });
});
