'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    multer = require('multer'),
    config = require(path.resolve('./config/config')),
    User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var user = req.user;
    var message = null;
    var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
    var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;

    if (user) {
        upload(req, res, function (uploadError) {
            if (uploadError) {
                return res.status(400).send({
                    message: 'Error occurred while uploading profile picture'
                });
            } else {
                user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

                user.save(function (saveError) {
                    if (saveError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(saveError)
                        });
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                res.json(user);
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Send User
 */
exports.me = function (req, res) {
    res.json(req.user || null);
};

exports.addTag = function (req, res) {
    var tagId = req.body.tagId;
    var tagName = req.body.tagName;
    var category = req.body.category;
    var email = req.body.email;
    var exist_user = req.user;
    console.log('EMAIL -' + email);
    console.log('tagId -' + tagId + ' tagna- ' + tagName + ' category- ' + category);
    return User.findOne({
        _id: exist_user._id
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        //if (!user || !user.authenticate(password)) {
        //    return done(null, false, {
        //        message: 'Invalid username or password'
        //    });
        //}
        user.tags.push({
            _id: tagId,
            name: tagName,
            category: category,
        });
        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user.tags);
                    }
                });
            }
        });

    });
    //   res.json(req.user || null);
};

exports.removeTag = function (req, res) {
    var tagId = req.params.tagId;
    var email = req.query.email;
    //var exist_user = req.user;
    console.log('USERID -' + email._id);
    console.log('tagId -' + tagId);
    return User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        var tags = [];
        user.tags.forEach(function (t) {
            if (t._id.toString() !== tagId.toString()) {
                tags.push(t);
            }
        });

        user.tags = tags;
        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user.tags);
                    }
                });
            }
        });

    });
    //   res.json(req.user || null);
};

exports.setToken = function (req, res) {
    var token = req.body.token;
    var email = req.body.email;

    console.log('Token -----------' + token);
    console.log('EMAIL -----------' + email);

    return User.findOne({
        username: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            var u = {};
            u.username = req.body.email;
            u.firstName = req.body.email;
            u.lastName = req.body.email;
            u.password = 'qwe123';
            u.email = req.body.email;
            u.token = token;
            console.log('AFTER-----------------' + JSON.stringify(u));
            var user = new User(u);
            var message = null;

            // Add missing user fields
            user.provider = 'local';
            user.displayName = user.firstName + ' ' + user.lastName;

            // Then save the user
            user.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    // Remove sensitive data before login
                    user.password = undefined;
                    user.salt = undefined;

                    req.login(user, function (err) {
                        if (err) {

                            res.status(400).send(err);
                        } else {

                            res.json(user);
                        }
                    });
                }
            });
        } else {
            user.token = token;
            user.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    req.login(user, function (err) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.json(user.token);
                        }
                    });
                }
            });
        }


    });
    //   res.json(req.user || null);
};







