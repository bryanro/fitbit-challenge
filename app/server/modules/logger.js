// default verbosity level is info
var currentVerbosityLevel = 'info';
var verbosityLevels = ['debug', 'info', 'warn', 'error', 'off'];
var authDebuggingOn = false;

var log = function (logLevel, logText, functionName, username) {
    if (verbosityLevels.indexOf(logLevel) >= 0
        && verbosityLevels.indexOf(logLevel) >= verbosityLevels.indexOf(currentVerbosityLevel)) {

        var dateNow = new Date();

        console.log(dateNow.toJSON() +
            ' ' +
            logLevel.toUpperCase() +
            (logLevel.length == 4 ? ' ' : '') +
            ' ' +
            (typeof functionName === 'undefined' ? '' : '[' + functionName + '] ') +
            logText +
            (typeof username === 'undefined' ? '' : ' (' + username + ')'));
    }
}

exports.setVerbosity = function (verbosityLevel) {
    if (verbosityLevels.indexOf(verbosityLevel) >= 0) {
        currentVerbosityLevel = verbosityLevel;
        log('info', 'Logger verbosity level set to: ' + verbosityLevel, 'logger');
    }
    else {
        log('error', 'Logger unable to set verbosity level to: ' + verbosityLevel, 'logger');
    }
}



exports.debug = function (logText, functionName, username) {
    if (functionName !== 'auth.js' || authDebuggingOn) {
        log('debug', logText, functionName, username);
    }
}

exports.info = function (logText, functionName, username) {
    log('info', logText, functionName, username);
}

exports.warn = function (logText, functionName, username) {
    log('warn', logText, functionName, username);
}

exports.error = function (logText, functionName, username) {
    log('error', logText, functionName, username);
}