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
var validation = require('../lib/index');

describe('Utils', function () {
    describe('flatten', function () {
        it('flatten is available', function (done) {
            validation.utils.flatten.should.have.type('function');
            done();
        });

        it('flatting', function (done) {
            var before = {
                foo: {
                    ooo: 'bar',
                    bar: 1337
                }
            };

            var after = {
                'foo.ooo': 'bar',
                'foo.bar': 1337
            };

            var beforeFlattend = JSON.stringify(validation.utils.flatten(before));
            var afterFlattend = JSON.stringify(after);

            beforeFlattend.should.equal(afterFlattend);
            done();
        });

        it('de-flatting', function (done) {
            var origin = {
                foo: {
                    ooo: 'bar',
                    bar: 1337,
                    faa: true,
                    have: { a: 'look' }
                },
                test: 1
            };

            var remake = JSON.stringify(validation.utils.deflat(validation.utils.flatten(origin)));
            remake.should.equal(JSON.stringify(origin));
            done();
        });
    });
});
