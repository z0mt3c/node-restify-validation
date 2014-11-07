/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

module.exports.handle = function (errors, req, res, options, next) {
    return res.send(400, {
        status: 'validation failed',
        errors: errors
    });
};