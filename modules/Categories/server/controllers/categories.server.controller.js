'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
//var gcm = require('node-gcm');
var gcm = require('node-gcm-service');
var _ = require('lodash');
var http = require('http');

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
    console.log('-------------------GET TAG MESSAGES------------');
    console.log('CategoryId ' + categoryId);
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
    var message = req.body.text;
    var email = req.body.email;
    var user = req.body.user;

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
                tag.messages.push({text: message, email: email});
                category.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log('tags saved with new message');
                        console.log('before sending message');
                        //var message = new gcm.Message({
                        //    collapseKey: 'demo',
                        //    priority: 'high',
                        //    contentAvailable: true,
                        //    delayWhileIdle: true,
                        //    timeToLive: 3,
                        //    restrictedPackageName: "com.holdings888.noti",
                        //    dryRun: true,
                        //    data: {
                        //        key1: 'message1',
                        //        key2: 'message2'
                        //    },
                        //    notification: {
                        //        title: "Hello, World",
                        //        icon: "ic_launcher",
                        //        body: "This is a notification that will be displayed ASAP."
                        //    }
                        //});


                        var post_dat = {
                            collapseKey: 'demo',
                            data: {
                                key1: 'message1',
                                key2: 'message2'
                            }
                        };

                        //var message = new gcm.Message();
                        //message.addData('key1', 'hello XXX');
                        //message.delay_while_idle = 1;
                        //
                        //var sender = new gcm.Sender('AIzaSyD_3tq6_JFg5lJEzabvclnaSsUDSqvNqPE');

                        // console.log('GCM OBJECT is ' + JSON.stringify(sender));
                        User.find({'tags._id': tag._id}).exec(function (err, users) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                console.log('Founded users ' + JSON.stringify(users));
                                var registrationTokens = [];
                                users.forEach(function (u) {
                                    registrationTokens.push(u.token);
                                });
                                var message = new gcm.Message({
                                    collapse_key: 'test',
                                    data: {
                                        key1: 'value1'
                                    },
                                    delay_while_idle: true,
                                    time_to_live: 34,
                                    dry_run: false
                                });

                                var sender = new gcm.Sender();

// set api key
                                sender.setAPIKey('AIzaSyD_3tq6_JFg5lJEzabvclnaSsUDSqvNqPE');
                                sender.sendMessage(message.toJSON(), registrationTokens, false, function(err, data) {
                                        if (err) console.error(err);
                                        else    console.log(response);
                                });
                                //sender.send(message, {registrationTokens: registrationTokens}, function (err, response) {
                                //    if (err) console.error(err);
                                //    else    console.log(response);
                                //});
                            }
                        });
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
