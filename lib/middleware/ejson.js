/**
 * @file ejson数据封装
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (context) {
    var res = context.response;

    if (res.type == 'ejson') {
        var data = {
            status: res.status,
            data: res.content || '',
            statusInfo: res.info || ''
        };

        res.status = 200;
        res.type = 'json';
        res.content = data;
    }

    context.next();
};
