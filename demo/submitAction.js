var webser = require('../lib/main');

webser.action('/submit', {
    POST: function (data) {
        return this.render('./submitResult.tpl', data);
    }
}, exports);
