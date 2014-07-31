/**
 * @file 启动server
 * @author treelite(c.xinle@gmail.com)
 */

var extend = require('./lib/util/extend');
var path = require('path');

var DEFAULT_CONFIG = {
    port: 8080,
    webDir: './web',
    libDir: './routes',
    logDir: './log'
};

module.exports = function (config) {
    var server = require('./lib/server');

    config = extend(DEFAULT_CONFIG, config || {});
    server.start(config);

    console.log('server start at ' + config.port);
};
