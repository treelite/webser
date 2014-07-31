/**
 * @file 上下文对象
 * @author treelite(c.xinle@gmail.com)
 */

var extend = require('./util/extend');
var urlHelper = require('url');
var querystring = require('querystring');

var UID = 0;

/**
 * 创建请求对象
 *
 * @inner
 * @param {Object} req
 * @return {Object}
 */
function createRequestInfo(req) {
    var url = urlHelper.parse(req.url);

    if (url.search) {
        var search = url.serach.substring(1);
        req.query = querystring.parse(search);
    }

    req.path = url.pathname;

    return req; 
}

/**
 * Context
 *
 * @constructor
 */
function Context(req, options) {
    extend(this, options);

    this.id = UID++;

    this.request = createRequestInfo(req);

    this.response = {
        headers: {}
    };
}

module.exports = Context;
