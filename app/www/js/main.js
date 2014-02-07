require.config({
    paths: {
        jquery: 'lib/jquery/jquery-1.10.2',
        backbone: 'lib/backbone/backbone-1.0.0',
        bootstrap: 'lib/bootstrap/bootstrap-3.0.0',
        less: 'lib/less/less-1.3.1.min',
        moment: 'lib/moment/moment-1.7.2.min',
        text: 'lib/require/text-2.0.7',
        underscore: 'lib/underscore/underscore-1.5.1',
        util: 'util',
        flot: 'lib/flot/jquery.flot',
        flottime: 'lib/flot/jquery.flot.time',
        flottooltip: 'lib/flot/jquery.flot.tooltip',
        flotorderbars: 'lib/flot/jquery.flot.orderbars',
        tablesorter: 'lib/tablesorter/jquery.tablesorter.min',
        table2csv: 'lib/table2csv/table2csv'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery']
        },
        flot: {
            deps: ['jquery']
        },
        flottime: {
            deps: ['flot']
        },
        flottooltip: {
            deps: ['flot']
        },
        flotorderbars: {
            deps: ['flot']
        },
        table2csv: {
            deps: ['jquery']
        }
    }
});

require([
  // Load our app module and pass it to our definition function
  'bootstrap',
  'less',
  'app'
], function (Bootstrap, Less, App) {

    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
    App.initialize();
});