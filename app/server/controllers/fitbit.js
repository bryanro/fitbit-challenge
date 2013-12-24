var app = module.parent.exports.app;
var mongoose = require('mongoose');
var logger = require('../modules/logger');
var Config = require('./config');
var User = require('./user');
var ActivityLog = require('./activitylog');
var moment = require('moment');
var OAuth = require('oauth');
var $ = require('jquery');
var _ = require('underscore');
//var ActivityLogModel = mongoose.model('ActivityLog');

var FitbitController = {};

FitbitController.initializeOAuth = function () {
    logger.debug('Initializing FitbitController.oAuth', 'initializeOAuth');
    FitbitController.oAuth = new OAuth.OAuth(
        'https://api.fitbit.com/oauth/request_token',
        'https://api.fitbit.com/oauth/access_token',
        FitbitController.config.fitbitConsumerKey,
        FitbitController.config.fitbitConsumerSecret,
        '1.0',
        null,
        'HMAC-SHA1'
    );
}

FitbitController.initialize = function () {

    FitbitController.config = {};

    Config.getConfigValue('fitbitConsumerKey', function (err, fitbitConsumerKey) {
        if (err) {
            logger.error('Error getting fitbitConsumerKey.', 'fitbit initialize');
        }
        else if (!fitbitConsumerKey) {
            logger.error('Error finding fitbitConsumerKey.', 'fitbit initialize');
        }
        else {
            logger.debug('Success finding fitbitConsumerKey', 'fitbit initialize');
            FitbitController.config.fitbitConsumerKey = fitbitConsumerKey;
        }
    });

    Config.getConfigValue('fitbitConsumerSecret', function (err, fitbitConsumerSecret) {
        if (err) {
            logger.error('Error getting fitbitConsumerSecret.', 'fitbit initialize');
        }
        else if (!fitbitConsumerSecret) {
            logger.error('Error finding fitbitConsumerSecret.', 'fitbit initialize');
        }
        else {
            logger.debug('Success finding fitbitConsumerSecret', 'fitbit initialize');
            FitbitController.config.fitbitConsumerSecret = fitbitConsumerSecret;
        }
    });

    Config.getConfigValue('fitbitCallbackUri', function (err, fitbitCallbackUri) {
        if (err) {
            logger.error('Error getting fitbitCallbackUri.', 'fitbit initialize');
        }
        else if (!fitbitCallbackUri) {
            logger.error('Error finding fitbitCallbackUri.', 'fitbit initialize');
        }
        else {
            logger.debug('Success finding fitbitCallbackUri', 'fitbit initialize');
            FitbitController.config.fitbitCallbackUri = fitbitCallbackUri;
        }
    });

    // wait 1 second and then initialize the oauth
    setTimeout(FitbitController.initializeOAuth, 1000);
}

FitbitController.authenticate = function (req, res) {
    logger.debug('Entering fitbit.authenticate()', 'fitbit.authenticate');

    FitbitController.oAuth.getOAuthRequestToken(function (err, oauthToken, oauthTokenSecret, results) {
        if (err) {
            res.send(500, 'Error getting OAuth request token : ' + error);
        } else {
            logger.debug('Successfully retrieved oauthToken (' + oauthToken + ') and oauthTokenSecret (' + oauthTokenSecret + ')', 'fitbit.authenticate');
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            logger.debug('req.session.oauthRequestToken: ' + req.session.oauthRequestToken);
            logger.debug('req.session.oauthRequestTokenSecret: ' + req.session.oauthRequestTokenSecret);
            res.redirect("http://www.fitbit.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken);
        }
    });
}

FitbitController.authRedirect = function (req, res) {
    logger.debug('req.session.oauthRequestToken: ' + req.session.oauthRequestToken);
    logger.debug('req.session.oauthRequestTokenSecret: ' + req.session.oauthRequestTokenSecret);

    logger.debug('req.query.oauth_verifier: ' + req.query.oauth_verifier, 'fitbit authRedirect');
    FitbitController.oAuth.getOAuthAccessToken(
        req.session.oauthRequestToken,
        req.session.oauthRequestTokenSecret,
        req.query.oauth_verifier,
        function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if (error) {
                res.send('Error getting OAuth access token: ' + error + '[' + oauthAccessToken + ']' + '[' + oauthAccessTokenSecret + ']' + '[' + results + ']', 500);
            } else {
                FitbitController.getUserInfo(req, function (err, userDataJson) {
                    if (err) {
                        logger.error('Error getting user info: ' + JSON.stringify(err), 'authRedirect');
                        res.send(500, err.message);
                    }
                    else {
                        var userData = JSON.parse(userDataJson);
                        _.extend(userData, { "oauth": { "oauthAccessToken": oauthAccessToken, "oauthAccessTokenSecret": oauthAccessTokenSecret }});
                        User.createOrUpdateFitbitUser(userData, function (err, user) {
                            if (err) {
                                logger.error('Error creating or updating fitbit user: ' + err, 'authRedirect');
                                res.send(500, err);
                            }
                            else {
                                req.session.user = user;
                                res.send(200, 'Results: ' + JSON.stringify(user));
                            }
                        });
                    }
                });
            }
        }
    );
}

FitbitController.getUserInfo = function (req, callback) {
    var oauthToken = req.session.oauthAccessToken;
    var oauthTokenSecret = req.session.oauthAccessTokenSecret;
    FitbitController.oAuth.get('https://api.fitbit.com/1/user/-/profile.json', oauthToken, oauthTokenSecret, callback);
}

FitbitController.saveActivitySeries = function (user, callback) {
    logger.debug('Entering saveActivitySeries', 'saveActivitySeries', user.username);
    FitbitController.getActivitySeries(user, function (err, activityDataJson) {
        if (err) {
            logger.error('Error getting activity series: ' + JSON.stringify(err), 'saveActivitySeries', user.username);
        }
        else {
            var activityData = JSON.parse(activityDataJson);

            logger.debug('activityData["activities-log-steps"]: ' + JSON.stringify(activityData, null, '\t'));

            ActivityLog.saveFitbitActivityLogEvents(user, activityData);
        }
    });
}

FitbitController.getActivitySeries = function (user, callback) {
    // assumption: start date of competition is 12/15/2013
    var url = 'https://api.fitbit.com/1/user/' + user.username + '/activities/steps/date/2013-12-15/today.json';
    FitbitController.oAuth.get(url, user.fitbitOAuthAccessToken, user.fitbitOAuthAccessTokenSecret, callback);
}

FitbitController.initialize();

module.exports = FitbitController;

logger.debug('fitbit.js module loaded', 'fitbit.js');