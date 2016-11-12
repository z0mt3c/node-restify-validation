/*
 * The MIT License
 *
 * Copyright 2015 Timo Behrmann, Guillaume Chauvet
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
'use strict';

var restify = require('restify');
var validationParser = require('../../lib').validationPlugin;
var request = require('supertest');

describe("[INTEGRATION][RESTIFY]", function() {

  describe('ISSUES', function() {

    describe('#32', function() {

      var server;

      before(function(done) {
        server = restify.createServer();
        server.use(restify.bodyParser({
          mapParams: false
        }));
        server.use(validationParser({
          forbidUndefinedVariables: true
        }));
        server.listen(0, function() {
          server.post({
            url: '/foo/:id',
            validation: {
              resources: {
                id: {
                  isRequired: true,
                  'swaggerScope': 'path'
                }
              },
              content: {
                name: {
                  isRequired: false
                },
                grades: {
                  isRequired: false
                },
                school: {
                  isRequired: false
                },
                subjectArea: {
                  isRequired: false
                }
              }
            }
          }, function(req, res, next) {
            res.send(req.body);
            next();
          });
          done();
        });
      });

      after(function(done) {
        server.close(done);
      });


      describe("on GET", function() {
        it("not allowed route", function(done) {
          request(server)
            .get('/foo')
            .expect(404)
            .end(done);
        });
      });

      describe("on POST", function() {
        it("with 1 optional field", function(done) {
          request(server)
            .post('/foo/73')
            .send({
              "name": "test"
            })
            .expect(200, {
              "name": "test"
            })
            .end(done);
        });
      });
    });

    describe('#37', function() {

      var server;
      before(function(done) {
        server = restify.createServer();
        server.use(restify.bodyParser({ mapParams: false }));
        server.use(validationParser({ mapParams: true }));
        server.use(restify.queryParser({ mapParams: false }));
        server.listen(0, function() {
          server.get({
            url: '/test/:name',
            validation: {
              queries: {
                age: {
                  isRequired: true
                }
              }
            }
          }, function(req, res, next) {
            res.send(req.params);
            next();
          });
          done();
        });
      });

      after(function(done) {
        server.close(done);
      });

      describe("on GET", function() {

        it("no route", function(done) {
          request(server)
            .get('/test')
            .expect(404)
            .end(done);
        });

        it("with undefined query", function(done) {
          request(server)
            .get('/test/foo')
            .expect(409, {
              code: "InvalidArgument",
              errors: [
                {
                  scope: "queries",
                  field: "age",
                  type: "MISSING",
                  reason: "Field is required",
                }
              ],
              message: "Validation failed"
            })
            .end(done);
        });

        it("with query present", function(done) {
          request(server)
            .get('/test/foo?age=1')
            .expect(200)
            .end(done);
        });

      });

    });

    describe('#52 - Support header validation', function() {

      var server;

      before(function (done) {
        server = restify.createServer();
        server.use(restify.bodyParser());
        server.use(validationParser({
          forbidUndefinedVariables: false
        }));
        server.listen(0, function() {
          server.post({
            url: '/foo/:id',
            validation: {
              resources: {
                id: { isRequired: true }
              },
              content: {
                name: {isRequired: true},
              },
              headers: {
                "request-id": { isRequired: true, isNumeric: true },
              }
            }
          }, function (req, res, next) {
            res.send(req.body);
            next();
          });
          done();
        });
      });

      after(function (done) {
        server.close(done);
      });

      describe("on POST", function() {

        it("with required header field", function (done) {
          request(server)
            .post('/foo/73')
            .set('Request-Id', 12345)
            .send({"name": "test"})
            .expect(200, {"name": "test"})
            .end(done);
        });

        it("without required header field", function (done) {
          request(server)
            .post('/foo/73')
            .send({"name": "test"})
            .expect(409,  {
              code: "InvalidArgument",
              errors: [
                {
                  scope: "headers",
                  field: "request-id",
                  type: "MISSING",
                  reason: "Field is required",
                }
              ],
              message: "Validation failed"
            })
            .end(done);
        });
      });

    });

  });
});
