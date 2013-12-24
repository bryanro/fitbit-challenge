define([
  'backbone',
  'models/user.model'
], function (Backbone, UserModel) {
    var UserCollection = Backbone.Collection.extend({
        model: UserModel,
        url: '/users',
        initialize: function () {
        }
    });

    return UserCollection;
});