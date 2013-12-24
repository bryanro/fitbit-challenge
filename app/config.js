module.exports = {
    development: {
        mongoConn: 'mongodb://localhost/fitnesschallenge',
        verbosityLevel: 'debug',
        sessionExpiration: 86400000 * 30    // 30 days
    },
    production: {
        mongoConn: 'mongodb://localhost/fitnesschallenge',
        verbosityLevel: 'debug',
        sessionExpiration: 86400000 * 10    // 10 days
    }
}