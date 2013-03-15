/**
 * @file webser
 * @author cxl(c.xinle@gmail.com)
 */

var server = require('./webser/server');
var rounter = require('./webser/rounter');
var action = require('./webser/action');

/**
 * 生成页面Action
 *
 * @param {string} url 页面URL
 * @param {Object} defines Action定义
 *  @param {Object.<string, string>} defines.template 页面的模块
 *  @param {Function<string, context>} defines.GET GET请求处理函数 返回结果字符串
 *  @param {Function<string, context>} defines.POST POST请求处理函数 返回结果字符串
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
 * @param {Object} context 服务器的环境变量，会被传递给Action
 * @return {Object} server实例
 */
exports.start = function (port, root, context) {
    var config = {};
    config.port = port || 8080; 
    config.root = root || './';
    context = context || {};
    
    return server.start(
        rounter.create(root, context),
        config
    );
};
