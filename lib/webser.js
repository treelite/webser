/**
 * @file webser
 * @author cxl(c.xinle@gmail.com)
 */

var server = require('./webser/server');
var rounter = require('./webser/rounter');
var action = require('./webser/action');

// 运行实例
var instance = {};

/**
 * 生成页面Action
 *
 * @param {string} url 页面URL
 * @param {Object} defines Action定义
 *  @param {Function<Object, context>} defines.GET GET请求处理函数 返回结果字符串
 *  @param {Function<Object, context>} defines.POST POST请求处理函数 返回结果字符串
 * @param {Object} item Action的exports参数
 */
exports.action = function (url, defines, item) {
    action.create(url, defines, item);
};

/**
 * 启动服务器
 *
 * @param {string} port 端口 默认8080
 * @param {string} root server根目录位置
 * @param {string} source server程序目录 如果不是额外设置取root
 * @param {Object} context 服务器的环境变量，会被传递给Action
 * @return {Object} server实例
 */
exports.start = function (port, root, source, context) {
    var config = {};
    config.port = port || 8080; 
    config.root = root = root || './';
    config.source = source = source || root;
    context = context || {};

    instance.rounter = rounter.create(root, source, context);
    instance.server = server.start(instance.rounter, config);

    return instance.server;
};


/**
 * 动态添加Action
 * 必须在服务启动之后
 *
 * @param {string} url
 * @param {Object} methods action的动作
 *  @param {Function<Object, context>} methods.GET GET请求处理函数 返回结果字符串
 *  @param {Function<Object, context>} methods.POST POST请求处理函数 返回结果字符串
 */
exports.add = function (url, methods) {
    if (!instance.rounter) {
        throw new Error('you can not add Actions by this way before start your server');
    }

    var item = action.create(url, methods);
    item.path = __dirname;
    instance.rounter.add(url, item);
}
