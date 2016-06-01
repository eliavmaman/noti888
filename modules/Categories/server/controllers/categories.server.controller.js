'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var gcm = require('node-gcm');
var _ =require('lodash');

/**
 * Create a category
 */
exports.create = function (req, res) {
    var category = new Category(req.body);
    category.user = req.user;

    category.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(category);
        }
    });
};

/**
 * Show the current category
 */
exports.read = function (req, res) {
    res.json(req.category);
};

/**
 * Update a category
 */
exports.update = function (req, res) {
    var category = req.category;

    category.name = req.body.name;
    category.tags = req.body.tags;

    category.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(category);
        }
    });
};

/**
 * Delete an category
 */
exports.delete = function (req, res) {
    var category = req.category;

    category.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(category);
        }
    });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
    Category.find().sort('-created').populate('user', 'displayName').exec(function (err, categories) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(categories);
        }
    });
};

exports.getTagMessages = function (req, res) {
    var categoryId = req.params.categoryId;
    var tagId = req.params.tagId;
    console.log('TAg id ' + tagId);
    var message = new gcm.Message({
        collapseKey: 'demo',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        restrictedPackageName: "somePackageName",
        dryRun: true,
        data: {
            key1: 'message1',
            key2: 'message2'
        },
        notification: {
            title: "Hello, World",
            icon: "ic_launcher",
            body: "This is a notification that will be displayed ASAP."
        }
    });
    var sender = new gcm.Sender('AIzaSyC4z6DS37mFtIrpn55Yicr59SpA84WV7nE');

    Category.findOne({_id: categoryId}).sort('-created').populate('user', 'displayName').exec(function (err, category) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('CATEGORY ' + JSON.stringify(category));
            var tag = _.find(category.tags, function (t) {
                return t._id.toString() === tagId.toString();
            });
            console.log('Tag ' + JSON.stringify(tag));
            if (tag) {
                res.json(tag.messages);
            } else {
                res.json([]);
            }
        }
    });
};

exports.addMessage = function (req, res) {
    var categoryId = req.params.categoryId;
    var tagId = req.params.tagId;
    var message=req.body.text;
    var user=req.body.user;

    console.log('TAg id ' + tagId);
    Category.findOne({_id: categoryId}).sort('-created').populate('user', 'displayName').exec(function (err, category) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('CATEGORY ' + JSON.stringify(category));
            var tag = _.find(category.tags, function (t) {
                return t._id.toString() === tagId.toString();
            });
            console.log('Tag ' + JSON.stringify(tag));
            if (tag) {
               tag.messages.push({text:message,user:user});
                category.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json([tag.messages]);
                    }
                });

            } else {
                res.json([]);
            }


        }
    });
};


/**
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Category is invalid'
        });
    }

    Category.findById(id).populate('user', 'displayName').exec(function (err, category) {
        if (err) {
            return next(err);
        } else if (!category) {
            return res.status(404).send({
                message: 'No category with that identifier has been found'
            });
        }
        req.category = category;
        next();
    });
};
