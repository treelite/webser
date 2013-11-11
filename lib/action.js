var mu = require('mu2');
var util = require('util');
var pathHelper = require('path');
var BaseAction = function (req, rep, root, path, context) {
        this._req = req;
        this._rep = rep;
        this._path = path;
        this._root = root;
        this._context = context;
    };

BaseAction.prototype.render = function (template, options) {
    var path;
    if (template.charAt(0) == '/') {
        path = pathHelper.normalize(this._root + template);
    }
    else {
        path = pathHelper.normalize(pathHelper.dirname(this._path) + '/' + template);
    }
    return mu.compileAndRender(path, options);
}

BaseAction.prototype.renderText = function (template, options) {
    var path;
    if (template.charAt(0) == '/') {
        path = pathHelper.normalize(this._root + template);
    }
    else {
        path = pathHelper.normalize(pathHelper.dirname(this._path) + '/' + template);
    }
    return mu.renderText(path, options);
}

BaseAction.prototype.renderJSON = function (options, replacer) {
    return JSON.stringify(options, replacer);
}

BaseAction.prototype.__do__ = function (method, queryString) {
    var rep = this._rep,
        html = this[method](queryString, this._context);

    if (typeof html == 'string') {
        rep.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': html.length
        });
        rep.end(html);
    }
    else {
        util.pump(html, rep);
    }
}

function extend(source, target) {
    for (key in target) {
        source[key] = target[key];
    }
}

exports.create = function (url, methods, modules) {
    var Action = function (req, rep, path, context) {
            this.super.constructor.call(this, req, rep, path, context);
        };

    Action.prototype = new BaseAction();
    methods = methods || {};
    methods.super = Action.prototype;
    extend(Action.prototype, methods);

    modules = modules || {};
    modules.url = url;
    modules.create = function (req, rep, root, path, context) {
        return new Action(req, rep, root, path, context);
    }
    modules.hasMethod = function (method) {
        return !!methods[method];
    }

    return modules;
}
