#!/bin/env node

var express = require('express');
var mongoose = require('mongoose');
var fs		= require('fs');
var path    = require('path');
var application_root = __dirname;
var logger = require('./app/server/modules/logger');
var mongoStore = require('connect-mongo')(express); // for session management

console.log('***************');
console.log('***************');

/**
 * Define the application.
 */
var MyApp = function() {

    // Scope.
    var self = this;

    /* ================================================================ */
    /* Helper functions. */
    /* ================================================================ */

    /**
	 * Set up server IP address and port # using env variables/defaults.
	 */
    self.setupVariables = function() {
        // Set the environment variables we need.
        self.ipaddress = '127.0.0.1';
        self.port      = 3001; // default to port 3001 when run locally
    };

    /**
	 * terminator === the termination handler Terminate server on receipt of the
	 * specified signal.
	 * 
	 * @param {string}
	 *            sig Signal to terminate on.
	 */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            logger.warn('Received ' + sig + ' - terminating application', 'server.js');
            process.exit(1);
        }
        logger.warn('Node server stopped', 'server.js');
    };


    /**
	 * Setup termination handlers (for exit and a list of signals).
	 */
    self.setupTerminationHandlers = function(){
        // Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /* ================================================================ */
    /* App server functions (main app logic here). */
    /* ================================================================ */

    /**
	 * Initialize the server (express) and create the routes and register the
	 * handlers.
	 */
    self.initializeServer = function() {
        var env = 'development'; // default to development
		// TODO: set environment variable properly
        logger.info('Environment: ' + env, 'server.js');

        self.app = express();
		// set the config based on the environment
        self.app.config = require('./app/config')[env];

        // set logging verbosity level
        logger.setVerbosity(self.app.config.verbosityLevel);

        // connect to mongodb using config's connection info
        self.app.mongooseConnection = mongoose.connect(self.app.config.mongoConn, function(err){
            if (err){
                logger.error('Error connecting to mongoose database (' + self.app.config.mongoConn + '): ' + err, 'server.js');
            }
            else {
                logger.info('Successfully connected to mongoose', 'server.js');
            }
        });

		// export the app so it can be used in other files
        module.exports.app = self.app;

        // bootstrap all of the models
        var modelsPath = __dirname + '/app/server/models';
        var modelFiles = fs.readdirSync(modelsPath);
        modelFiles.forEach(function (file) {
            require(modelsPath + '/' + file)
        });

        var allowCrossDomain = require('./app/server/modules/allowcrossdomain');

        self.app.configure(function () {
            self.app.use(express.cookieParser()),
            self.app.use(express.bodyParser({ uploadDir: __dirname + '/app/upload' })), // set the default upload directory
            self.app.use(express.session({
                store: new mongoStore({
                    url: self.app.config.mongoConn
                }),
                secret: '!!!t3@m CHALLENGE!!!',
                cookie: {
                    maxAge: self.app.config.sessionExpiration
                }
            }));
            // Uncomment to allow cross domain
            self.app.use(allowCrossDomain),
            self.app.use(self.app.router),
            self.app.use(express.static(__dirname + '/app/www')),
            self.app.use(express.errorHandler());
        });

        // initialize the routes
        require('./app/server/routes')(self.app);
    };


    /**
	 * Initializes the application.
	 */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
	 * Start the server (starts up the application).
	 */
    self.start = function() {
        // Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            logger.info('Node server started: ' + self.ipaddress + ':' + self.port, 'server.js');
        });
    };
};



/**
 * main(): Main code.
 */
var myApp = new MyApp();
myApp.initialize();
myApp.start();