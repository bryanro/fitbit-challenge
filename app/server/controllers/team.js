var mongoose = require('mongoose');
var app = module.parent.exports.app;
var TeamModel = mongoose.model('Team');
var Config = require('./config');
var logger = require('../modules/logger');
var _ = require('underscore');

var TeamController = {};

TeamController.getTeams = function(req, res) {
    logger.debug('Entering getTeams', 'getTeams');
    TeamModel.find({}, function(err, teams) {
        if (err) {
            logger.error('Error retrieving teams: ' + err, 'getTeams');
            res.send(500, err);
        }
        else {
            logger.debug('Success retrieving ' + teams.length + ' teams', 'getTeams');
            res.send(200, teams);
        }
    });
}

module.exports = TeamController;

logger.debug('team.js controller loaded', 'team.js');