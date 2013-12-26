var logger = require('./modules/logger');

module.exports = function (app) {

    // Export the app so it can be used by the controllers
    module.exports.app = app;

    // Test
    app.get('/test', function (req, res) {
        res.send('API is running');
    });

    // HTML Pages
    app.get('/', function (req, res) {
        res.sendfile('./app/www/index.html');
    });

    app.post('/logout', function (req, res) {
        req.session.destroy();
		res.send(200, 'Session destroyed');
    });

    // Options for CORS
    app.options('/*', function (req, res) {
        res.send(200);
    });

    // Fitbit
    var fitbit = require('./controllers/fitbit');
    app.get('/auth/fitbit/authenticate', fitbit.authenticate);
    app.get('/auth/fitbit/redirect', fitbit.authRedirect);

    // Activity Log
    var activityLog = require('./controllers/activitylog');
    app.get('/activity-logs', activityLog.getAllActivityLogs);
    app.get('/activity-logs/:id', activityLog.getActivityLog);

    // Team
    var team = require('./controllers/team');
    app.get('/teams', team.getTeams);

    // Scheduler
    var scheduler = require('./controllers/scheduler');
    app.get('/manual/update', function (req, res) {
        scheduler.updateActivityData();
        res.send(200);
    });

    // User
    var user = require('./controllers/user');
    /*app.get('/users', function (req,res) {
        user.getAllFitbitUsers(function (err, users) {
            res.send(200, 'Users: ' + JSON.stringify(users, null, '\t'));
        })
    });*/

    logger.info('Finished setting up routes', 'routes.js');
}