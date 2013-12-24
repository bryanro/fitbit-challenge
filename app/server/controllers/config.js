var mongoose = require('mongoose');
var app = module.parent.exports.app;
var ConfigModel = mongoose.model('Config');
var logger = require('../modules/logger');

var ConfigController = {};

ConfigController.getConfigValue = function (key, callback) {
    ConfigModel.findOne({ key: key }, function (err, config) {
        if (err) {
            logger.error('Error trying to find config in database: ' + err, 'getConfigValue');
            callback('Error getting config value for key: ' + key + '.');
        }
        else if (!config) {
            logger.error('Config for create account pw not found in database', 'getConfigValue');
            callback('Error finding config value for key: ' + key + '.');
        }
        else {
            logger.debug('Configuration found for key ' + key + '.', 'getConfigValue');
            callback(null, config.value);
        }
    });
}

module.exports = ConfigController;

logger.debug('config.js controller loaded', 'config.js');