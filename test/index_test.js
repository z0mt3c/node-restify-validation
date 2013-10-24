/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var index = require('../lib/index');

var req_validation_empty = { route: { validation: {} } };
var req_empty = { route: {} };
var res_empty = {};
var error = [
    { foo: 'bar' }
];

describe('Plugin test', function () {
    it('Plugin is available', function (done) {
        index.validationPlugin.should.have.type('function');
        index.validationPlugin().should.have.type('function');
        done();
    });

    it('Call handleErrors on validation failures', function (done) {
        var processValidation = sinon.stub(index.validation, 'process', function (validationModel, req, options) {
            return error;
        });

        var handleErrors = sinon.stub(index.error, 'handle', function (errors, req, res, options, next) {
            errors.should.equal(error);
            req.should.equal(req_validation_empty);
            res.should.equal(res_empty);
            processValidation.called.should.be.ok;
            handleErrors.called.should.be.ok;
            processValidation.restore();
            handleErrors.restore();
            done();
            return null;
        });

        index.validationPlugin()(req_validation_empty, res_empty, function () {
            true.should.not.be.ok;
        });
    });

    it('Call next on successful validation', function (done) {
        var processValidation = sinon.stub(index.validation, 'process', function (validationModel, req, options) {
            req.should.equal(req_validation_empty);
            return [];
        });

        var handleErrorsSpy = sinon.spy(index.error, 'handle');

        index.validationPlugin()(req_validation_empty, res_empty, function () {
            handleErrorsSpy.called.should.not.be.ok;
            handleErrorsSpy.restore();
            processValidation.called.should.be.ok;
            processValidation.restore();
            done();
        });
    });

    it('Call next if no validation model is defined', function (done) {
        var processValidation = sinon.spy(index.validation, 'process');
        var handleErrorsSpy = sinon.spy(index.error, 'handle');

        index.validationPlugin()(req_empty, res_empty, function () {
            processValidation.called.should.not.be.ok;
            processValidation.restore();
            handleErrorsSpy.called.should.not.be.ok;
            handleErrorsSpy.restore();
            done();
        });
    });
});
