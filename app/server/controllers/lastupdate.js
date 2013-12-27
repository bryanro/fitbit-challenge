var app = module.parent.exports.app;
var logger = require('../modules/logger');

var LastUpdateController = {};

LastUpdateController.setLastUpdateTime = function (lastUpdateTime) {
    LastUpdateController.lastUpdateTime = lastUpdateTime || new Date();
    logger.debug('lastUpdateTime set to: ' + LastUpdateController.lastUpdateTime, 'setLastUpdateTime');
}

LastUpdateController.getLastUpdateTime = function (req, res) {
    logger.debug('Getting lastUpdateTime: ' + LastUpdateController.lastUpdateTime, 'getLastUpdateTime');
    res.send(200, { lastUpdateTime: LastUpdateController.lastUpdateTime});
}

module.exports = LastUpdateController;

logger.debug('lastupdate.js loaded', 'lastupdate.js')