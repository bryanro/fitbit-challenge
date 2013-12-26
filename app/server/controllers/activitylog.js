var mongoose = require('mongoose');
var app = module.parent.exports.app;
var UserModel = mongoose.model('User');
var ActivityLogModel = mongoose.model('ActivityLog');
var Config = require('./config');
var logger = require('../modules/logger');
var _ = require('underscore');

var ActivityLogController = {};

/**
 * Find an existing activity log for a given user or create one if the activity log doesn't already exist
 * @param user UserModel of the activity log
 * @param callback The callback that should have parameters (err, activityLog)
 */
ActivityLogController.getUserActivityLog = function (user, callback) {
    ActivityLogModel.findOne({ user: user}, function (err, activityLog) {
        if (err) {
            logger.error('Error getting activity log for user: ' + err, 'getUserActivityLog', user.username);
            callback(err);
        }
        else if (!activityLog) {
            logger.debug('User activity log not found, creating new one', 'getUserActivityLog', user.username);
            var activityLog = new ActivityLogModel({
                user: user
            });
            activityLog.save(function (err, activityLog) {
                if (err) {
                    logger.error('Error creating activity log: ' + err, 'getUserActivityLog', user.username);
                    callback(err);
                }
                else {
                    logger.debug('Successfully created activity log', 'getUserActivityLog', user.username);
                    callback(null, activityLog);
                }
            });
        }
        else {
            logger.debug('Found user activity log', 'getUserActivityLog', user.username);
            callback(null, activityLog);
        }
    });
}

ActivityLogController.saveFitbitActivityLogEvents = function (user, fitbitActivityLogs, callback) {
    logger.debug('Entering saveFitbitActivityLogEvents', 'saveFitbitActivityLogEvents');

    ActivityLogController.getUserActivityLog(user, function (err, dbActivityLog) {
        if (err) {
            logger.error('Error getting activity log: ' + err, 'saveFitbitActivityLogEvents', user.username);
            callback(err);
        }
        else {
            var events = [];
            // iterate through each item from the fitbit API
            _.each(fitbitActivityLogs["activities-steps"], function (fitbitActivityDay) {
                //logger.debug('Iteration for date: ' + fitbitActivityDay.dateTime);
                var event = {
                    date: new Date(fitbitActivityDay.dateTime + 'T00:00:00'),
                    steps: fitbitActivityDay.value
                };
                events.push(event);
            });
            dbActivityLog.addOrUpdateActivityLogEvents(events, function () {});
        }
    });
}

ActivityLogController.getAllActivityLogs = function (req, res) {
    ActivityLogModel.find({}).populate('user', 'username fullName displayName product userGraphColor').exec(function (err, activityLogs) {
        if (err) {
            logger.error('Error getting activity logs: ' + err, 'getAllActivityLogs');
            res.send(500);
        }
        else {
            logger.debug('Success getting activity logs', 'getAllActivityLogs');
            res.send(200, activityLogs);
        }
    });
}

ActivityLogController.getActivityLog = function (req, res) {
    if (!req.params.id) {
        logger.error('req.params.id not set', 'getActivityLog')
        res.send(500);
        return;
    }
    ActivityLogModel.findOne({ _id: req.params.id }).populate('user', 'username fullName displayName product').exec(function (err, activityLogs) {
        if (err) {
            logger.error('Error getting activity log: ' + err, 'getActivityLog');
            res.send(500);
        }
        else {
            logger.debug('Success getting activity log', 'getActivityLog');
            res.send(200, activityLogs);
        }
    });
}

module.exports = ActivityLogController;

logger.debug('activitylog.js controller loaded', 'activitylog.js');