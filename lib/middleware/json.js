/**
 * @file json数据输出
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (context) {
    var res = context.response;

    if (res.type == 'json') {
        res.content = JSON.stringify(res.content);
    }

    context.next();
};
