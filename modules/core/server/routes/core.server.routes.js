'use strict';

module.exports = function (app) {
    // Root routing
    var core = require('../controllers/core.server.controller');

    // Define error pages
    app.route('/server-error').get(core.renderServerError);

    // Return a 404 for all undefined api, module or lib routes
    app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);
    app.route('/scan')
        // .get(core.getScans)
        .post(core.createScan);
    app.route('/apk').get(core.getApk);
    app.route('/yambamail')
        .get(core.getScans)
        .post(core.saveScan);
    app.route('/cids')
        .get(core.cidList)
        .post(core.addCid);
    app.route('/cids/:cid')
        .delete(core.deleteCid)
    // Define application route
    app.route('/*').get(core.renderIndex);




};
