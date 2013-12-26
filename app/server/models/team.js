var mongoose = require('mongoose');
var logger = require('../modules/logger');

var TeamSchema = new mongoose.Schema({
    teamNum: { type: Number, required: true },
    teamName: { type: String, required: true },
    teamColor: { type: String, required: false },
    teamMembers: []     // usernames
});

mongoose.model('Team', TeamSchema);

logger.debug('config.js model loaded', 'config.js');