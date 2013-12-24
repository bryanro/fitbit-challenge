define([
  'jquery',
  'underscore',
  'backbone',
  'views/stats/stats.view'
  /* list of all other views used */
], function ($, _, Backbone, StatsView) {

    var Router = Backbone.Router.extend({

        initialize: function () {
        },

        routes: {
            // Define some URL routes
            'showUser': 'showDefault',

            // Default
            '*actions': 'showDefault'
        },

        showDefault: function () {
            this.statsView = new StatsView();
            this.statsView.render();
        }
    });

    var initialize = function () {
        var app_router = new Router();
        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});