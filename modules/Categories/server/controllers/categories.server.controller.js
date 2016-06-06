'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    async = require('async'),
    mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var gcm = require('node-gcm');
//var gcm = require('node-gcm-service');
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
    var email = req.query.email;
    console.log('-------------------GET TAG MESSAGES------------');
    console.log('EMAIL ' + email);
    console.log('CATEGOTY ID ' + categoryId);
    console.log('TAG ID ' + tagId);
    User.findOne({email: email}).exec(function (err, user) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            user.tags.forEach(function (t) {
                if (t._id.toString() === tagId.toString()) {
                    t.counter = 0;
                }
            });
            user.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    Category.findOne({_id: categoryId}).sort('-created').exec(function (err, category) {
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
                }
            });

        }
    })

};

exports.addMessage = function (req, res) {
    console.log('HEREEEEEEEEEEEEEEEEEE');
    var categoryId = req.params.categoryId;
    var tagId = req.params.tagId;
    var message = req.body.text;
    var email = req.body.email;
    var user = req.body.user;
    var savedCategory;
    console.log('TAg id ' + tagId);
    Category.findOne({_id: categoryId}).sort('-created').populate('user', 'displayName')
        .exec(function (err, category) {
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
               return category.save(function (err, savedCategory) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log('tags saved with new message');
                        console.log('before sending message');
                        console.log('savedCategory is ' + JSON.stringify(savedCategory));
                        User.find({'tags._id': tagId}).exec(function (err, users) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                console.log('Founded users ' + JSON.stringify(users));
                                var registrationTokens = [];

                                users.forEach(function (u) {
                                    u.tags.forEach(function (t) {
                                        if (t._id.toString() === tagId.toString()) {
                                            t.counter = (t.counter + 1);
                                        }
                                    });
                                    if (u.token) {
                                        registrationTokens.push(u.token);
                                    }
                                });

                                console.log('REGISTRATION TOKEN ' + JSON.stringify(registrationTokens));

                                var gcm_message = new gcm.Message(),
                                    sender = new gcm.Sender('AIzaSyD_3tq6_JFg5lJEzabvclnaSsUDSqvNqPE'),
                                    RETRY_COUNT = 4;

                                // gcm_message.addDataWithKeyValue('key1', 'daddadas');
                                gcm_message.delayWhileIdle = true;
                                //gcm_message.addData('message', "\u270C Peace, Love \u2764 and PhoneGap \u2706!");
                                gcm_message.addData('message', message);
                                gcm_message.addData('title', 'Push Notification Sample');
                                gcm_message.addData('msgcnt', '3'); // Shows up in the notification in the status bar
                                gcm_message.addData('soundname', 'beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
                                //message.collapseKey = 'demo';

                                sender.send(gcm_message, registrationTokens, 4, function (err, result) {
                                    if (err) {
                                        console.log('error from GCM');
                                        console.error(err);
                                    }

                                    var savedTag = _.find(savedCategory.tags, function (t) {
                                        return t._id.toString() === tagId.toString();
                                    });

                                   // console.log('savedTag  is ' + JSON.stringify(savedTag));
                                   // return savedTag;
                                    if (savedTag.messages.length > 0) {
                                        var last=savedTag.messages[savedTag.messages.length - 1];
                                        console.log('Return Message is ' + JSON.stringify(last));
                                         res.json(last);
                                    } else {
                                        res.json(null);
                                    }

                                    // callback(err, result);
                                });


                                async.eachSeries(users, function (user, asyncdone) {
                                    user.save(asyncdone);
                                }, function (err) {
                                    console.log('error save all users');
                                    if (err) return console.log(err);

                                    // done(); // or `done(err)` if you want the pass the error up
                                });

                            }
                        });
                    }
                });

            } else {
                return null;
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
