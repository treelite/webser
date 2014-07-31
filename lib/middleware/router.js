/**
 * @file 路由器
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');
var fs = require('fs');
var mimeTypes = require('../util/mime-types');

/**
 * 默认处理器
 *
 * @inner
 * @param {Object} context
 */
function defaultHandler(context) {
    var req = context.request;
    var res = context.response;
    var url = req.path.substring(1);
    var file = path.resolve(context.webDir, url);

    fs.exists(file, function (exists) {
        if (exists) {
            var extname = path.extname(file).substring(1).toLowerCase();
            var contentType = mimeTypes[extname] || mimeTypes.html;

            fs.readFile(file, function (error, data) {
                if (error) {
                    throw error;
                }
                
                res.content = data;
                res.headers['Content-Type'] = contentType;
                res.headers['Content-Length'] = data.length;
            });
        }
        else {
            res.status = 404;
            res.content = 'Not Found';
        }

        context.next();
    });
}

var handlers;
/**
 * 加载处理器
 *
 * @inner
 */
function load(dir) {
    var files = fs.readdirSync(dir);

    var file;
    var stats;
    handlers = [];
    files.forEach(function (name) {
        // 排除隐藏文件
        if (name.charAt(0) == '.') {
            return;
        }

        file = path.resolve(dir, name);
        stats = fs.statSync(file);
        if (stats.isDirectory()) {
            load(file);
        }
        else if (stats.isFile()
            && path.extname(name) == '.js'
        ) {
            name = name.slice(0, -3);
            var handler = require(dir + '/' + name);
            handler.location = handler.location || ('/' + name);
            handlers.push(handler);
        }
    });
}

/**
 * 路由管理
 *
 * @public
 * @param {Object} context
 */
module.exports = function (context) {
    if (!handlers) {
        load(context.libDir);
    }

    var req = context.request;
    var handled = handlers.some(function (item) {
        var found;
        if (item.location instanceof RegExp) {
            found = item.location.test(req.path);
        }
        else {
            found = item.location == req.path;
        }

        if (found && item[req.method]) {
            item[req.method](context);
        }
        else {
            found = false;
        }

        return found;
    });

    if (!handled) {
        defaultHandler(context);
    }

};
