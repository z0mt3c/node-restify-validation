var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var validation = require('../index');

describe('Utils', function () {
    describe('flatten', function () {
        it('flatten is available', function (done) {
            validation.utils.flatten.should.be.a('function');
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
    });
});
