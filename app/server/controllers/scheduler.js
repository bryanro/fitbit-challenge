var logger = require('../modules/logger');
var Config = require('../controllers/config');
var _ = require('underscore');
var moment = require('moment');
var UserController = require('../controllers/user');
var FitbitController = require('../controllers/fitbit');

var Scheduler = {};

Scheduler.setupSchedule = function () {
    var cronJob = require('cron').CronJob;
    var cronDateTime = '0 0 5 * * *'; // occur every day at 5am by default

    // get cronDateTime from config
    Config.getConfigValue('cronDateTime', function (err, configCronDateTime) {
        if (err) {
            logger.error('Error getting cronDateTime.', 'setupScheduler');
        }
        else if (!configCronDateTime) {
            logger.error('Error finding cronDateTime.', 'setupScheduler');
        }
        else {
            logger.debug('Success finding cronDateTime', 'setupScheduler');
            cronDateTime = configCronDateTime;
        }

        logger.info('Setting schedule to the following cronDateTime: ' + cronDateTime, 'setupScheduler');
        var updateActivityData = new cronJob(cronDateTime, Scheduler.updateActivityData, null, true, 'America/New_York');
    });
}

Scheduler.updateActivityData = function () {
    logger.debug('Entering Scheduler.updateActivityData', 'updateActivityData');

    UserController.getAllFitbitUsers(function (err, users) {
        if (err) {
            logger.error('Unable to get all users, so not processing emails for anyone', 'updateActivityData');
            return;
        }
        else {
            logger.debug('Iterating through ' + users.length + ' users', 'updateActivityData');
            _.each(users, function (user, userIterator) {
                FitbitController.saveActivitySeries(user, function (err) {
                    if (err) {
                        logger.error('Error saving activity series: ' + err, 'updateActivityData', user.username);
                    }
                    else {
                        logger.debug('Successfully saved activity series for user', 'updateActivityData', user.username);
                    }
                });
            });
        }
    });

}

module.exports = Scheduler;

logger.debug('scheduler.js loaded', 'scheduler.js');