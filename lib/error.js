module.exports.handle = function (errors, req, res, options, next) {
    return res.send(400, {
        status: 'validation failed',
        errors: errors
    });
};