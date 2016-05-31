'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Article = mongoose.model('Article'),
    User= mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var Promise = require('bluebird');

/**
 * Create a article
 */
exports.create = function (req, res) {
    var article = new Article(req.body);
    article.user = req.user;

    article.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
    res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
    var article = req.article;

    article.title = req.body.title;
    article.content = req.body.content;

    article.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
    var article = req.article;

    article.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
    Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(articles);
        }
    });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Article is invalid'
        });
    }

    Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
        if (err) {
            return next(err);
        } else if (!article) {
            return res.status(404).send({
                message: 'No article with that identifier has been found'
            });
        }
        req.article = article;
        next();
    });
};


exports.articlesByTag = function (req, res) {
    var tagId = req.params.tagId;
    Article.find({'tag._id': tagId}).populate('user', 'displayName').exec(function (err, articles) {
        if (err) {
            return next(err);
        } else if (!articles) {
            return res.status(404).send({
                message: 'No article with that identifier has been found'
            });
        }
        res.json(articles);
    });
};
exports.notifyTag = function (req, res) {
    function getTemplates(res, user) {
        var httpTransport = 'http://';
        if (config.secure && config.secure.ssl === true) {
            httpTransport = 'https://';
        }
        console.log('B4 TEMPLATE ' + JSON.stringify(user));
        return res.render(path.resolve('modules/users/server/templates/article-notify'), {
            name: user.displayName
            //appName: config.app.title,
            //url: httpTransport + req.headers.host + '/api/auth/reset/' + token
        }).then(function (template) {
            console.log('Founded TEMPLATE ' + JSON.stringify(template));
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Article notify from noti888',
                html: template
            };
            console.log(JSON.stringify(smtpTransport));
            return smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    console.log('SENT SUCCESS user-  ' + user.displayName);
                    res.send({
                        message: 'An email has been sent to the provided email with further instructions.'
                    });
                } else {
                    console.log(JSON.stringify(err));
                    return res.status(400).send({
                        message: 'Failure sending email'
                    });
                }

                done(err);
            });
        });
    }

    function sendEmail(user, template) {

    }

    var tagId = req.params.tagId;
    User.find({'tags._id': tagId}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        return users;
    }).then(function (users) {
        console.log('Founded users ' + JSON.stringify(users));
        var promises = [];
        users.forEach(function (user) {
        return  promises.push(getTemplates(res, user));
        });
        return Promise.all(promises);
    });

};

