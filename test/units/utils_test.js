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
var should = require('should');
var utils = require('../../lib/utils');

describe('Utils', function () {
    describe('hasValue', function () {
        it('for null', function (done) {
            utils.hasValue(null).should.false;
            done();
        });

        it('for undefined', function (done) {
            utils.hasValue(undefined).should.false;
            done();
        });
        
        it('for string', function (done) {
            utils.hasValue("").should.false;
            utils.hasValue("a").should.true;
            done();
        });
        
        it('for array', function (done) {
            utils.hasValue([]).should.false;
            utils.hasValue(["a"]).should.true;
            done();
        });

    });
    
    describe('getExternalScope', function () {
        it('for null', function (done) {
            (utils.getExternalScope(null) === undefined).should.be.true;
            done();
        });
        
        it('for resources', function (done) {
            utils.getExternalScope('resources').should.equal('params');
            done();
        });
        it('for queries', function (done) {
            utils.getExternalScope('queries').should.equal('query');
            done();
        });
        it('for body', function (done) {
            utils.getExternalScope('content').should.equal('body');
            done();
        });
        it('for headers', function (done) {
            utils.getExternalScope('headers').should.equal('headers');
            done();
        });
    });
    
    describe('getInternalScope', function () {
        it('for null', function (done) {
            (utils.getInternalScope(null) === undefined).should.be.true;
            done();
        });
        
        it('for resources', function (done) {
            utils.getInternalScope('params').should.equal('resources');
            done();
        });
        it('for queries', function (done) {
            utils.getInternalScope('query').should.equal('queries');
            done();
        });
        it('for body', function (done) {
            utils.getInternalScope('body').should.equal('content');
            done();
        });
        it('for headers', function (done) {
            utils.getInternalScope('headers').should.equal('headers');
            done();
        });
    });
});
