/*
 * Copyright (c) 2013 Timo Behrmann. All rights reserved.
 */

module.exports.handle = function (errors, req, res, options, next) {
    if(options.errorHandler) {
        return res.send(new options.errorHandler(errors));
    } else {
        return res.send (400, {
            status: 'validation failed',
            errors: errors
        });
    }
};