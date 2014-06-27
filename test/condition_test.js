/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var index = require('../lib/index');

describe('Conditions', function () {
    it('exists', function(done) {
        var validationReq = { params: { a: 'fdsa' } };
        var validationModel = {
            a: { exists: true},
            b: { isRequired: index.when.exists('a') }
        };

        var errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(1);
        errors[0].field.should.equal('b');
        errors[0].code.should.equal('MISSING');


        validationReq.params.b = 'test';
        var errors2 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors2.length.should.equal(0);

        validationReq.params = {};
        var errors3 = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors3.length.should.equal(0);

        done();
    });

    it('paramMatches', function (done) {
        var validationReq = { params: { a: 'fdsa' } };
        var validationModel = {
            a: { isRequired: false },
            b: { isRequired: index.when.paramMatches('a', ['asdf','fdsa']) }
        };

        var errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(1);
        errors[0].field.should.equal('b');
        errors[0].code.should.equal('MISSING');


        validationModel = {
            a: { isRequired: false },
            b: { isRequired: index.when.paramMatches('a', 'fdsa') }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(1);
        errors[0].field.should.equal('b');
        errors[0].code.should.equal('MISSING');

        validationModel = {
            a: { isRequired: false },
            b: { isRequired: index.when.paramMatches('a', 'asdf') }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(0);

        validationModel = {
            a: { isRequired: false },
            b: { isRequired: index.when.paramMatches('a', ['asdf']) }
        };

        errors = index.validation.process(validationModel, validationReq, { errorsAsArray: true });
        errors.length.should.equal(0);

        done();
    });
});
