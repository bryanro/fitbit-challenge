define([
  'jquery',
  'underscore',
  'backbone',
  'util/util',
  'models/user.model',
  'text!./login.html'
], function ($, _, Backbone, Util, UserModel, LoginTemplate) {

    var UserView = Backbone.View.extend({

        el: $('#main-container'),

        initialize: function (options) {
        },

        render: function () {
            this.loginTemplate = _.template(LoginTemplate);
            this.$el.html(this.loginTemplate({ }));
        },

        events: {
            'click #login-button': 'attemptLogin'
        },

        attemptLogin: function () {
            var username = $('#login-username').val();
            var password = $('#login-password').val();

            $.ajax({
                url: '/login',
                type: 'POST',
                data: { username: username, password: password },
                success: function (model, result, xhr) {
                    window.location = '/';
                },
                error: function (xhr, result, error) {
                    Util.ShowErrorAlert('Login failed', $('h2.form-signin-heading'));
                }
            });
        }
    });

    return UserView;
});