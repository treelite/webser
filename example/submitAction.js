var webser = require('../lib/webser');

webser.action('/submit', {
    POST: function (data) {
        return this.render('./submitResult.tpl', data);
    }
}, exports);
