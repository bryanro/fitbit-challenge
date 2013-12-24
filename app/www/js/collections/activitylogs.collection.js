define([
    'backbone',
    'models/activitylog.model'
], function (Backbone, ActivityLogModel) {
    var ActivityLogsCollection = Backbone.Collection.extend({
        model: ActivityLogModel,
        url: '/activity-logs',
        initialize: function () {
        }
    });
    return ActivityLogsCollection;
});