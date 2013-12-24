var mongoose = require('mongoose');
var app = module.parent.exports.app;
var UserModel = mongoose.model('User');
var Config = require('./config');
var logger = require('../modules/logger');

var LoginController = {};

LoginController.login = function (req, res) {
    logger.debug('Entering login()', 'login');
    if (typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
        logger.warn('Login username and/or password not defined', 'login');
        res.send(400, 'Username and password both required.');
        return;
    }
	
    var username = req.body.username;
    var password = req.body.password;

    // make sure the username find is case insensitive
    UserModel.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } }, function (err, user) {
        if (err) {
            logger.error('Error finding user in database: ' + err, 'login', username);
            res.send(500, 'Invalid username or password');
        }
        else if (!user) {
            logger.warn('User not found in database', 'login', username);
            res.send(400, 'Invalid username or password');
        }
        else {
            logger.debug('User found in database, compare encrypted password', 'login', username);
            user.authenticate(password, function (passwordMatch) {
                if (!passwordMatch) {
                    logger.warn('Invalid password', 'login', username);
                    res.send(400, 'Invalid username or password');
                }
                else {
                    logger.debug('Password match successful, authorizing user', 'login', username);
                    req.session.auth = true;
                    req.session.user = user;
                    res.send(200, user);
                }
            });
        }
    });
}

module.exports = LoginController;

logger.debug('login.js controller loaded', 'login.js');