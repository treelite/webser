var fs = require('fs');

function work(sPath, nameRegexp) {
    var res = [], dir = [],
        files = fs.readdirSync(sPath),
        i, item, stat;

    for (i = 0; item = files[i]; i++) {

        if (item.indexOf('.') == 0) {
            continue;
        }
        
        stat = fs.statSync(sPath + item);
        if (stat.isDirectory()) {
            dir.push(sPath + item + '/');
        }
        if (stat.isFile() && nameRegexp.test(item)) {
            res.push(sPath + item);
        }
    }


    for (i = 0; item = dir[i]; i++) {
        res = res.concat(work(item, nameRegexp));
    }

    return res;
}

exports.find = function (sPath, nameRegexp) {
    return work(sPath, new RegExp(nameRegexp));
}
