/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
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
