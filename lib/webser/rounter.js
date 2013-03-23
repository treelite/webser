/**
 * @file url rounter
 * @author cxl(c.xinle@gmail.com)
 */

var walker = require('./walker'); 
var querystring = require('querystring');
var pathHelper = require('path');
var urlHelper = require('url')

function Rounter(actionsMap, context) {
    this.actionsMap = actionsMap;
    this.context = context;
}

function parseUrlParams(str, source) {
    var items = querystring.parse(str),
        key;

    for (key in items) {
        source[key] = items[key];
    }
}

/**
 * 添加路由单元
 *
 * @param {string} url
 * @param {Object} action
 */
Rounter.prototype.add = function (url, action) {
    this.actionsMap[url] = action;
};

/**
 * 找到符合条件的Action
 *
 * @param {string} url
 * @param {string} method HTTP method
 *
 * @return {Object} action
 */
Rounter.prototype.match = function (url, method) {
    var params = [];
    var matchs;
    var key;
    var actionsMap = this.actionsMap;
    var context = this.contextl
    var action;
    var res = false;

    for (key in actionsMap) {
        action = actionsMap[key];
        params = [];

        key = key.replace(/:([^\/]+)/g, function ($0, $1) {
            params.push({key: $1});
            return '([^\\/]+)';
        });

        matchs = new RegExp('^' + key + '$').exec(url);
        if (matchs) {
            for (key = 1; key < matchs.length; key++) {
                params[key - 1].value = matchs[key];
            }
            break;
        }
        else {
            action = null;
        }
    }

    //TODO: rounter与server的职责有重复 待重构
    if (action && action.hasMethod(method)) {
        res = function (req, rep) {
            var optinos = {}, i, item,
                pathObj = urlHelper.parse(req.url),
                search = pathObj.search ? pathObj.search.substring(1) : '',
                postData = [];
            
            for (i = 0; item = params[i]; i++) {
                optinos[item.key] = decodeURIComponent(item.value);
            }

            parseUrlParams(search, optinos);

            action = action.create(req, rep, action.path, context);

            if (req.method == 'POST') {
                req.on('data', function (chunk) {
                    if (postData.length > 100) {
                        req.connection.destory();
                    }
                    else {
                        postData.push(chunk);
                    }
                });

                req.on('end', function () {
                    parseUrlParams(postData.join(''), optinos);
                    action.__do__('POST', optinos);
                });
            }
            else {
                action.__do__(method, optinos);
            }
        }
    }
  
    return res;
}

/**
 * 创建路由器
 * 找到所有以Action结尾的js文件 并按照模块的形式加载
 */
exports.create = function (path, context, config) {
    var actionsMap = {};
    var config = config || {};
    var paths = walker.find(path, (config.suffix || 'Action') +'.js$');

    for (var i = 0, item; item = paths[i]; i++) {
        var path = item;
        item = require(pathHelper.relative(__dirname, item.replace('.js', '')));
        item.path = path;
        actionsMap[item.url] = item;
    }

    return new Rounter(actionsMap, context);
}
