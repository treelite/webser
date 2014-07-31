/**
 * @file webserver
 * @author treelite(c.xinle@gmail.com)
 */

var http = require('http');
var domain = require('domain');
var querystring = require('querystring');

var log = require('./log');
var extend = require('./util/extend');
var mimeTypes = require('./util/mime-types');
var Context = require('./Context');

var middlewares = [
    require('./middleware/router'),
    require('./middleware/ejson'),
    require('./middleware/json')
];

/**
 * 管道化调用中间件
 *
 * @inner
 * @param {Object} context
 * @param {Function} callback
 */
function pipe(context, callback) {
    var index = 0;

    var next = context.next = function () {
        var handler = middlewares[index++];
        if (handler) {
            handler(context);
        }
        else {
            callback(context);
            
        }
    };

    context.end = function () {
        index = middlewares.length;
        next();
    };

    next();
}

/**
 * 请求响应
 *
 * @inner
 * @param {Object} req
 * @param {Object} res
 * @param {Object} config
 */
function handler(req, res, config) {
    // 访问日志
    log.info(req.url);

    var d = domain.create();

    // 创建上下文
    var context = new Context(req, config);
    context.log = log;

    // 请求响应
    function finish() {
        var response = context.response;
        var headers = {
            'Content-Type': mimeTypes.html,
            'Content-Length': response.content.length || 0
        };
        res.writeHead(
            response.status || 200,
            extend(headers, response.headers || {})
        );
        res.end(response.content);
        d.dispose();
    }

    d.on('error', function (e) {
        log.error(req.url + ' ' + e.message);
        context.response.status = 500;
        finish();
    });
    d.add(req);
    d.add(res);

    if (req.method == 'POST') {
        var data = [];
        req.on('data', function (chunk) {
            data.push(chunk);
        });
        req.on('end', function (chunk) {
            data.push(chunk);
            context.data = querystring.parse(data.join(''));
            d.run(function () {
                pipe(context, finish);
            });
        });
    }
    else {
        d.run(function () {
            pipe(context, finish);
        });
    }
}

/**
 * 启动server
 *
 * @public
 * @param {Object} config
 * @return {Server}
 */
exports.start = function (config) {
    log.init(config);

    var server = http.createServer(function (req, res) {
        handler(req, res, config);
    });
    server.listen(config.port);

    return server;
};

/**
 * 添加中间件到末尾
 *
 * @public
 * @param {Function} middleware
 */
exports.append = function (middleware) {
    middlewares.push(middleware);
};

/**
 * 插入中间件到起始
 *
 * @public
 * @param {Function} middleware
 */
exports.insert = function (middleware) {
    middlewares.unshift(middleware);
};
