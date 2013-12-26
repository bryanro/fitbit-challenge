define([
    'backbone',
    'models/team.model'
], function (Backbone, TeamModel) {
    var TeamCollection = Backbone.Collection.extend({
        model: TeamModel,
        url: '/teams',
        initialize: function () {
        }
    });
    return TeamCollection;
});