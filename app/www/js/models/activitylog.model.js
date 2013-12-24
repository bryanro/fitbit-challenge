define([
    'backbone'
], function (Backbone) {
    var ActivityLogModel = Backbone.Model.extend({
        idAttribute: '_id',
        initialize: function () {
        },
        urlRoot: '/activity-log'
    });

    return ActivityLogModel;
});