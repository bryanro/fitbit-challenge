define([
  'jquery',
  'underscore',
  'backbone',
  'models/user.model',
  'text!./user.html'
], function ($, _, Backbone, UserModel, UserTemplate) {

    var UserView = Backbone.View.extend({

        el: $('#main-container'),

        initialize: function (options) {
            this.user = new UserModel();
            this.user.fetch({
                success: function (model, result, options) {
                },
                error: function (model, xhr, options) {
                    // if user is not authenticated, redirect to login
                }
            });
        },

        render: function () {
            this.userTemplate = _.template(UserTemplate);
            this.$el.html(this.userTemplate({ user: this.user }));
        },

        events: {
        }
    });

    return UserView;
});