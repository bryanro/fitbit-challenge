define([
  'jquery',
  'underscore',
  'text!util/error.html'
], function ($, _, ErrorTemplate) {

    var Util = {

        ShowAlert: function (errorMessage, domElementAfter, alertType) {
            if (!alertType || alertType.length < 1) {
                alertType = 'danger';
            }
            var errorTemplate = _.template(ErrorTemplate);
            var errorText = errorTemplate({ errorId: new Date().getTime(), errorMessageText: errorMessage, alertType: alertType });
            var errorDom = $(errorTemplate({ errorId: new Date().getTime(), errorMessageText: errorMessage, alertType: alertType })).hide();
            domElementAfter.before(errorDom);
            errorDom.fadeIn('slow', function () {
                setTimeout(function () {
                    Util.CloseError(errorDom);
                }, 3000);
            });
        },

        ShowSuccessAlert: function (errorMessage, domElementAfter) {
            Util.ShowAlert(errorMessage, domElementAfter, 'success');
        },

        ShowInfoAlert: function (errorMessage, domElementAfter) {
            Util.ShowAlert(errorMessage, domElementAfter, 'info');
        },

        ShowWarningAlert: function (errorMessage, domElementAfter) {
            Util.ShowAlert(errorMessage, domElementAfter, 'warning');

        },

        ShowErrorAlert: function (errorMessage, domElementAfter) {
            Util.ShowAlert(errorMessage, domElementAfter, 'danger');
        },

        CloseError: function (targetDom) {
            if (targetDom) {
                targetDom.fadeOut('slow', function () {
                    targetDom.remove();
                });
            }
        }
    };

    return Util;

});