var mongoose = require('mongoose');
var logger = require('../modules/logger');

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fullName: { type: String },
    displayName: { type: String },
    email: { type: String },
    signupDate: { type: Date, default: Date.now },
    product: { type: String, required: true },
    fitbitOAuthAccessToken: { type: String },
    fitbitOAuthAccessTokenSecret: { type: String }
});

/* METHODS */
UserSchema.methods.updateFitbitOAuthToken = function (newOAuthToken, newOAuthTokenSecret, callback) {
    var user = this;
    if (newOAuthToken) {
        logger.debug('Entering updateFitbitOauthToken', 'UserSchema.updateFitbitOAuthToken', user.username);
        if (user.fitbitOAuthAccessToken !== newOAuthToken) {
            user.fitbitOAuthAccessToken = newOAuthToken;
            user.fitbitOAuthAccessTokenSecret = newOAuthTokenSecret;
        }
        user.save(callback); // callback(err, savedUser);
    }
    else {
        logger.error('newOAuthToken is undefined', 'UserSchema.updateFitbitOAuthToken', user.username);
        callback('newOAuthToken is undefined');
    }
}

mongoose.model('User', UserSchema);

logger.debug('users.js model loaded', 'users.js');