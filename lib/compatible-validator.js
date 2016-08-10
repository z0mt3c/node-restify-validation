/* 
 * The MIT License
 *
 * Copyright 2014 Timo Behrmann, Guillaume Chauvet.
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
var validator = require('validator');

// Because of changes in the new node-validator library we need to add a few functions
// for backwards compatibility
//
var compatibleValidator = Object.create( validator );
module.exports = compatibleValidator;

// Add the min/max validators
//
compatibleValidator.min = function(str, val)
{
    var number = parseFloat(str);
    return isNaN(number) || number >= val;
};

compatibleValidator.max = function(str, val)
{
    var number = parseFloat(str);
    return isNaN(number) || number <= val;
};

// Old isDecimal implementation doesn't exist anymore
//
compatibleValidator.isDecimal = function(str)
{
    return validator.isFloat(str);
};

// notIn is just inverted isIn
//
compatibleValidator.notIn = function(str, options)
{
    return !validator.isIn(str, options);
};

// Regular expression method now all use matches function
//
compatibleValidator.is = compatibleValidator.regex = function(str, pattern, modifiers)
{
    return validator.matches(str, pattern, modifiers);
};
compatibleValidator.not = compatibleValidator.notRegex = function(str, pattern, modifiers)
{
    return !validator.matches(str, pattern, modifiers);
};

compatibleValidator.notContains = function(str, elem)
{
    return !validator.contains(str, elem);
};

// New isURL validator has options
//
compatibleValidator.isUrl = compatibleValidator.isURL = function(str)
{
    return validator.isURL(str);
};

// IP checking validators now take a version parameter
//
compatibleValidator.isIP = function(str)
{
    return validator.isIP(str);
};

compatibleValidator.isIPv4 = function(str)
{
    return validator.isIP(str, 4);
};

compatibleValidator.isIPv6 = function(str)
{
    return validator.isIP(str, 6);
};

// The isUUID validator now supports a version parameter
//
compatibleValidator.isUUID = function(str)
{
    return validator.isUUID(str);
};
compatibleValidator.isUUIDv3 = function(str)
{
    return validator.isUUID(str, 3);
};
compatibleValidator.isUUIDv4 = function(str)
{
    return validator.isUUID(str, 4);
};
compatibleValidator.isUUIDv5 = function(str)
{
    return validator.isUUID(str, 5);
};
compatibleValidator.isNatural = function(str)
{
    return /^[0-9]+$/.test(str);
};
compatibleValidator.isBoolean = function(str) {
    return str === 'true' || str === 'false';
};