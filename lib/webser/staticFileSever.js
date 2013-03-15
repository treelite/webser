var fs = require('fs');
var contentTypeMap = {
        'html'  : 'text/html',
        'js'    : 'text/javascript',
        'css'   : 'text/css',
        'gif'   : 'image/gif',
        'jpeg'  : 'image/jpeg',
        'png'   : 'image/x-png'
    };

exports.get = function (path, rep) {
    var fileType = path.split('.')[1].toLowerCase();

    fs.readFile(path, function (err, data) {
        if (err) {
            rep.endError(404);
        }
        else {
            rep.writeHead(200, {
                'Content-Length': data.length,
                'Content-type': contentTypeMap[fileType] || 'text/plain'
            });
            rep.end(data);
        }
    });
}
