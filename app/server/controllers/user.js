var mongoose = require('mongoose');
var app = module.parent.exports.app;
var UserModel = mongoose.model('User');
var Config = require('./config');
var logger = require('../modules/logger');
var _ = require('underscore');

var UserController = {};

UserController.createOrUpdateFitbitUser = function (newUserParams, callback) {
    logger.debug('Entering createOrUpdateFitbitUser()', 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
    logger.debug('newUserParams.user.encodedId: ' + newUserParams.user.encodedId);

    UserModel.findOne({ username: newUserParams.user.encodedId }, function (err, existingUser) {
        if (err) {
            logger.error('Error validating username does not already exist: ' + err, 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
            callback(err);
        }
        else if (existingUser) {
            logger.info('Found existing user with same username, so just update oauth token', 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
            existingUser.updateFitbitOAuthToken(newUserParams.oauth.oauthAccessToken, newUserParams.oauth.oauthAccessTokenSecret, function (err, updatedUser) {
                if (err) {
                    logger.error('Error saving new fitbitOAuthToken: ' + err, 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
                    callback(err);
                }
                else {
                    logger.debug('Successfully updated new fitbitOAuthToken', 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
                    callback(null, updatedUser);
                }
            });
        }
        else {
            logger.debug('username does not already exist so proceed with creating new user', 'createOrUpdateFitbitUser', newUserParams.user.encodedId);
            logger.debug('newUserParams: ' + JSON.stringify(newUserParams));
            var user = new UserModel({
                username: newUserParams.user.encodedId,
                fullName: newUserParams.user.fullName,
                displayName: newUserParams.user.displayName,
                product: 'fitbit',
                fitbitOAuthAccessToken: newUserParams.oauth.oauthAccessToken,
                fitbitOAuthAccessTokenSecret: newUserParams.oauth.oauthAccessTokenSecret
            });
            user.save(function (err, user) {
                if (err) {
                    logger.error('Error creating new username: ' + err);
                    callback(err);
                }
                else {
                    logger.debug('Successfully created new user', 'createOrUpdateUser', user.username);
                    callback(null, user);
                }
            });
        }
    });
}

UserController.getFitbitUserInfo = function (username, callback) {
    logger.debug('Entering getFitbitUserInfo()', 'getFitbitUserInfo', username);
    UserModel.findOne({ username: username }, function (err, user) {
        if (err) {
            logger.error('Error finding user: ' + err, 'getFitbitUserInfo', username);
            callback(err);
        }
        else {
            logger.debug('User found', 'getFitbitUserInfo', username);
            callback(null, user);
        }
    });
}

UserController.getFitbitUsernameFromSession = function (req, callback) {
    logger.debug('Entering getFitbitUsernameFromSession()', 'getFitbitUsernameFromSession');
    if (!(req.session && req.session.auth && req.session.user)) {
        logger.error('Unauthorized attempt', 'getFitbitUsernameFromSession');
        callback('Unauthorized');
    }
    else {
        var username = req.session.user.username;
        logger.debug('Successfully retrieved username', 'getFitbitUsernameFromSession', username);
        callback(null, username);
    }
}

UserController.getAllFitbitUsers = function (callback) {
    logger.debug('Entering getAllUsers()', 'getAllFitbitUsers');

    UserModel.find({ product: 'fitbit' }, function (err, users) {
        if (err) {
            logger.error('Error getting all users: ' + err, 'getAllFitbitUsers');
            callback(err);
        }
        else {
            logger.debug('Success finding all users', 'getAllFitbitUsers');
            callback(null, users);
        }
    })
}

module.exports = UserController;

logger.debug('user.js controller loaded', 'user.js');