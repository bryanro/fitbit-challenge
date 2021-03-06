var logger = require('../modules/logger');
var Config = require('../controllers/config');
var _ = require('underscore');
var moment = require('moment');
var UserController = require('../controllers/user');
var LastUpdateController = require('../controllers/lastupdate');
var FitbitController = require('../controllers/fitbit');

var Scheduler = {};

Scheduler.setupSchedule = function () {
    var cronJob = require('cron').CronJob;
    var cronDateTime = '0 0 * * * *'; // occur every hour by default

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

        // when app starts up, wait 10 seconds then update the activity data
        setTimeout(Scheduler.updateActivityData, 10000);
    });
}

Scheduler.updateActivityData = function () {
    logger.debug('Entering Scheduler.updateActivityData', 'updateActivityData');

    UserController.getAllFitbitUsers(function (err, users) {
        if (err) {
            logger.error('Unable to get all users, so not updating activity data', 'updateActivityData');
        }
        else {
            logger.debug('Iterating through ' + users.length + ' users', 'updateActivityData');
            _.each(users, function (user) {
                FitbitController.saveActivitySeries(user, function (err) {
                    if (err) {
                        logger.error('Error saving activity series: ' + err, 'updateActivityData', user.username);
                    }
                    else {
                        logger.debug('Successfully saved activity series for user', 'updateActivityData', user.username);
                    }
                });
            });

            LastUpdateController.setLastUpdateTime();
        }
    });
}

Scheduler.setupSchedule();

module.exports = Scheduler;

logger.debug('scheduler.js loaded', 'scheduler.js');