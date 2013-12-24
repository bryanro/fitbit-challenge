var mongoose = require('mongoose');
var logger = require('../modules/logger');

var ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
});

mongoose.model('Config', ConfigSchema);

logger.debug('config.js model loaded', 'config.js');