/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var index = require('../lib/index');

describe('Errors', function () {
    it('handle errors object', function (done) {

        var send = sinon.spy();
        var next = sinon.spy();
        var res = { send: send };
        var errors = {};

        index.error.handle(errors, null, res, null, next);

        next.called.should.not.be.ok;
        send.calledWith(400, {
            status: 'validation failed',
            errors: errors
        }).should.be.ok;

        done();
    });

    it('handle errors array', function (done) {

        var send = sinon.spy();
        var next = sinon.spy();
        var res = { send: send };
        var errors = [];

        index.error.handle(errors, null, res, null, next);

        next.called.should.not.be.ok;
        send.calledWith(400, {
            status: 'validation failed',
            errors: errors
        }).should.be.ok;

        done();
    });

});
