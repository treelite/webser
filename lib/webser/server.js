var http = require("http");
var url = require('url');
var util = require('util');
var pathHelper = require('path');
var staticFiles = require('./staticFileSever');
var urlRounter;
var root;
var indexFile;
var PORT = 8080;

function httpErrorHandler(code, msg) {
    var html = [];
    if (code >= 500) {
        html.push('<h1>Server Error</h1>');
    }
    else if (code >= 400) {
        html.push('<h1>Not Found</h1>');
    }
    if (msg) {
        html.push('<p>' + msg + '</p>');
    }

    html = html.join('');
    this.writeHead(code, {
        'Content-Type': 'text/html',
        'Content-Length': html.length
    });
    this.end(html);
}

function onRequireHanlder(req, rep) {
    var path = url.parse(req.url).pathname;

    util.log('require:' + path);
    
    rep.endError = httpErrorHandler;

    var handler;
    if (path.indexOf('.') >= 0) {
        staticFiles.get(pathHelper.normalize(root + path), rep);
    }
    else if (handler = urlRounter.match(path,  req.method)) {
        try {
            handler.call(null, req, rep);
        }
        catch(e) {
            util.error(e.stack);
            rep.endError(500);
        }
    }
    else if (path == '/') {
        path += indexFile;
        staticFiles.get(pathHelper.normalize(root + path), rep);
    }
    else {
        rep.endError(404);
    }
};

exports.start = function (rounter, config) {
    var server = http.createServer(onRequireHanlder);
    
    config = config || {};
    root = config.root || './';
    indexFile = config.index || 'index.html';
    urlRounter = rounter;
    server.listen(config.port || PORT);
    util.log('server run');
    return server;
};
