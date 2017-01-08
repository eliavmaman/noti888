'use strict';
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Cid = mongoose.model('Cid');
/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
    res.render('modules/core/server/views/index', {
        user: req.user || null
    });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
    res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
    });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

    res.status(404).format({
        'text/html': function () {
            res.render('modules/core/server/views/404', {
                url: req.originalUrl
            });
        },
        'application/json': function () {
            res.json({
                error: 'Path not found'
            });
        },
        'default': function () {
            res.send('Path not found');
        }
    });
};

exports.addCid = function (req, res) {
    var cid = new Cid(req.body);
    console.log('here---- '+JSON.stringify(cid));
    cid.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(cid);
        }
    });
};

exports.cidList = function (req, res) {
    Cid.find().sort('-created').exec(function (err, cids) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('here list---- '+JSON.stringify(cids));
            res.json(cids);
        }
    });
};
