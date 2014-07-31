/**
 * @file 对象扩展
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (target, source) {
    Object.keys(source).forEach(function (key) {
        target[key] = source[key];
    });
    return target;
};
