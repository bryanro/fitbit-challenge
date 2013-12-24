var mongoose = require('mongoose');
var logger = require('../modules/logger');
var _ = require('underscore');

var ActivityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    activityData: [{
        date: Date,
        steps: Number
    }],
    lastUpdate: Date
});

ActivityLogSchema.pre('save', function (next) {
    var activityLog = this;
    logger.debug('Entering pre()', 'ActivityLogSchema.pre');
    activityLog.lastUpdate = new Date();
    next();
    return;
});

/* METHODS */
ActivityLogSchema.methods.addOrUpdateActivityLogEvents = function (events, callback) {
    var activityLog = this;

    // iterate through events and remove any dates saved in the database for which there are new events
    _.each(events, function (event) {
        if (!event || !event.date || !event.steps) {
            logger.error('Event object not set properly: ' + JSON.stringify(event), 'addOrUpdateActivityLogEvent')
        }
        else {
            // remove element from list if one exists for that date
            activityLog.activityData = _.reject(activityLog.activityData, function (dayData) {
                //logger.debug('date comparison: ' + dayData.date.toJSON() + ' | ' + event.date.toJSON() + '...' + (dayData.date === event.date), 'addOrUpdateActivityLogEvent');
                return dayData.date.getTime() == event.date.getTime();
            });
        }
    });
    // merge the new 'events' data with the existing data
    activityLog.activityData = _.union(activityLog.activityData, events);
    //logger.debug('activityLog to save: \n' + JSON.stringify(activityLog, null, '\t'), 'addOrUpdateActivityLogEvent');
    activityLog.save(function (err, updatedActivityLog) {
        if (err) {
            logger.error('Error saving updated activity log: ' + err, 'addOrUpdateActivityLogEvent');
            callback(err);
        }
        else {
            logger.debug('Successfully updated activity log', 'addOrUpdateActivityLogEvent');
            //logger.debug('activityLog saved: \n' + JSON.stringify(updatedActivityLog, null, '\t'), 'addOrUpdateActivityLogEvent');
            callback(null, updatedActivityLog);
        }
    });
}

mongoose.model('ActivityLog', ActivityLogSchema);

logger.debug('activitylog.js model loaded', 'activitylog.js');