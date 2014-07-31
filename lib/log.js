/**
 * @file 日志模块
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var path = require('path');

/**
 * 日志目录
 *
 * @type {string}
 */
var LOG_DIR = path.resolve(process.cwd(), 'log');

function pad(num) {
    return (num < 10 ? '0' : '') + num;
}

function log(type, msg) {
    var now = new Date();

    var names = [];
    names.push(now.getFullYear());
    names.push(pad(now.getMonth() + 1));
    names.push(pad(now.getDay()));

    var times = [];
    times.push(pad(now.getHours()));
    times.push(pad(now.getMinutes()));
    times.push(pad(now.getSeconds()));

    var file = path.resolve(LOG_DIR, names.join(''));

    var content = ''
        + '\n'
        + '[' + type.toUpperCase() + '] ' 
        + times.join(':') + ' '
        + msg;

    var stream = fs.createWriteStream(
        file, 
        {
            flags: 'a+'
        }
    );

    stream.write(content, 'utf-8');
}

/**
 * 日志模块初始化
 *
 * @public
 * @param {Object} config
 * @param {string} config.logDir 日志目录
 */
exports.init = function (config) {
    LOG_DIR = config.logDir || LOG_DIR;
    if (!fs.existsSync(LOG_DIR)) {
        require('mkdirp').sync(LOG_DIR);
    }
};

/**
 * 导出API
 */
['debug', 'info', 'warn', 'error'].forEach(
    function (type) {
        exports[type] = function (msg) {
            log(type, msg);
        };
    }
);
