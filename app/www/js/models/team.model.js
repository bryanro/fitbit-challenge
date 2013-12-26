define([
    'backbone'
], function (Backbone) {
    var TeamModel = Backbone.Model.extend({
        idAttribute: '_id',
        initialize: function () {
        },
        urlRoot: '/team'
    });

    return TeamModel;
});