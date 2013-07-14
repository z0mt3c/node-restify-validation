node-restify-validation
=======================
Validation for REST Services built with node-restify in node.js

[![Build Status](https://travis-ci.org/z0mt3c/node-restify-validation.png)](https://travis-ci.org/z0mt3c/node-restify-validation)
[![Coverage Status](https://coveralls.io/repos/z0mt3c/node-restify-validation/badge.png?branch=master)](https://coveralls.io/r/z0mt3c/node-restify-validation?branch=master)
[![Dependency Status](https://gemnasium.com/z0mt3c/node-restify-validation.png)](https://gemnasium.com/z0mt3c/node-restify-validation)


Simple request validation with node-restify
-------------------------------------------
Goal of this little project is to have the validation rules / schema on one hand as close to the route itself as possible without messing up the logic with further LOCs on the other hand.


    var server = restify.createServer();
    server.use(restify.queryParser());
    server.use(restifyValidation.validationPlugin( { errorsAsArray: false }));
    
    /**
     * Test Route
     */
    server.get({url: '/test/:name', validation: {
        name: { isRequired: true, isIn: ['foo','bar'], scope: 'path' },
        status: { isRequired: true, isIn: ['foo','bar'], scope: 'query' },
        email: { isRequired: false, isEmail: true, scope: 'query' },
        age: { isRequired: true, isInt: true, scope: 'query' }
    }}, function (req, res, next) {
        res.send(req.params);
    });


Documentation powered by swagger
--------------------------------
On top of the validation schema the [node-restify-swagger](https://github.com/z0mt3c/node-restify-swagger) library should later-on generate the swagger resources to provide a hands-on documentation. 

Demo project
------------
A simple demo project can be cloned from [node-restify-demo](https://github.com/z0mt3c/node-restify-demo).

Inspiration
-----------
node-restify-validation was & is inspired by [backbone.validation](https://github.com/thedersen/backbone.validation). 
In terms of validation node-restify-validation makes use of [node-validator](https://github.com/chriso/node-validator).



