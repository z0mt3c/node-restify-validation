/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var _ = require('underscore');
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
    it('node-validator', function () {
        test('isEmail', true, 'test@email.de', 'asdfasdf.de');
        test('isUrl', true, 'http://www.google.de', 'asdfasdf');
        test('isIP', true, '127.0.0.1', 'asdf');
        test('isIPv4', true, '127.0.0.1', 'asdf');
        test('isIPv6', true, '2001:0db8:85a3:08d3:1319:8a2e:0370:7344', 'asdf');
        test('isAlpha', true, 'abc', 'a1');
        test('isAlphanumeric', true, 'a1', 'a1!');
        test('isNumeric', true, '1', 'asd');
        test('isHexadecimal', true, 'df', 'w');
        test('isHexColor', true, ['#000000', 'ffffff'], '#aaaaaaaasdf');
        test('isInt', true, '123', 'a1');
        test('isLowercase', true, 'abc', 'aBc');
        test('isUppercase', true, 'ABC', 'ABc');
        test('isDecimal', true, '0.5', '0,5');
        test('isFloat', true, '0.5', '0,5');
        test('equals', 'foobar', 'foobar', 'foobar2');
        test('contains', 'foo', 'foobar', 'bar');
        test('notContains', 'bar', 'foo', 'barbar');

        // not supported:
        //test('notNull', true, '0.5', ' ');
        //test('isNull', true, '0.5', ' ');
        //test('notEmpty', true, '0.5', '     ');
        //test('len', [3,5], 'aaaa', ['aa','dddddd']);

        test('is', /^abc$/, 'abc', 'aac');
        test('regex', /^abc$/, 'abc', 'aac');
        test('notRegex', /^abc$/, 'acc', 'abc');
        test('not', /^abc$/, 'acc', 'abc');

        test('isIn', ['a','bc'], ['a','bc'], 'c');
        test('notIn', ['a','bc'], 'c', ['a','bc']);
        test('max', 5, [1,'2',5], [6,'7']);
        test('min', 5, [5, 6,'7'], [1,'2']);
        test('isCreditCard', true, [], 'adua8suzd8azs7dadsdad');
        test('isUUID', true, 'A987FBC9-4BED-3078-CF07-9141BA07C9F3', 'abc');
        test('isUUIDv3', true, '987FBC97-4BED-3078-AF07-9141BA07C9F3', 'abc');
        test('isUUIDv4', true, '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1', 'abc');
        test('isUUIDv5', true, '987FBC97-4BED-5078-AF07-9141BA07C9F3', 'abc');
        test('isDate', true, '2011-08-04', '20110804');
        test('isBefore', '2011-08-04', '2011-08-03', '2011-08-04');
        test('isAfter', '2011-08-04', '2011-08-05', '2011-08-04');
    });
});
