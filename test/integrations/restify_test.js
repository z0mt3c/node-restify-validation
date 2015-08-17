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
var bodyParser = require('../../lib');
var request = require('supertest');

describe("[INTEGRATION][RESTIFY]", function () {

    var server;

    before(function (done) {
        server = restify.createServer();
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
            }, function (req, res, next) {
                res.send(req.params);
		next();
            });
            done();
        });
    });

    after(function (done) {
        server.close(done);
    });

   
    describe("on GET", function() {
    
        it("no route", function (done) {
            request(server)
            .get('/')
            .expect(404)
            .end(done);
        });

    });
});
