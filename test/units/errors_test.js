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
var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var index = require('../../lib/index');

function errorHandler(message) {
  return {
    code: 'InvalidArgument',
    message: message
  }
}

describe('Errors', function () {
    it('handle errors with a custom errorHandler', function (done) {
        var send = sinon.spy();
        var next = sinon.spy();
        var res = { send: send };
        var errors = { dummy: {
            scope: 'queries',
            field: 'dummy',
            code: 'MISSING',
            message: 'Field is required'
          }
        };

        index.error.handle(errors, null, res, {errorHandler: errorHandler}, next);

        next.called.should.not.be.ok;
        send.calledWith({
            code: 'InvalidArgument',
            message: 'dummy (MISSING): Field is required'
        }).should.be.ok;

        done();
    });

    it('handle errors object', function (done) {

        var send = sinon.spy();
        var next = sinon.spy();
        var res = { send: send };
        var errors = {};

        index.error.handle(errors, null, res, {}, next);

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

        index.error.handle(errors, null, res, {}, next);

        next.called.should.not.be.ok;
        send.calledWith(400, {
            status: 'validation failed',
            errors: errors
        }).should.be.ok;

        done();
    });

});
