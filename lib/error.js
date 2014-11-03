/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

var handler = require('node-restify-errors');

module.exports.handle = function (errors, req, res, options, next) {
    return res.send(new handler.InvalidContentError(errors));
};
