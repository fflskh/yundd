/**
 * Created by ko on 2015/7/9.
 */
'use strict';
angular.module('YDD').controller('formCtrl',['app','restAPI', '$scope', '$routeParams',function(app,restAPI,$scope,$routeParams) {

    // we will store all of our form data in this object
    $scope.formData = {};

    var init=function(){
        var params = {
            ID: new Date().getTime(),
            OP: 'getone'
        };
        app.promiseGet(params, restAPI.index, app.param(params)).then(function (data) {
            if (data && typeof(data) === 'object') {
                $scope.formData=data;
            }
        });
    }
    init();
    // function to process the form
    $scope.processForm = function() {

        var data =  $scope.formData;
        restAPI.index.save({
            ID: new Date().getTime(),
            OP: 'save'
        },data, function (data) {
            if (data.success) {
                alert('土豪，我们是朋友了!');
            } else {
                alert('土豪，我们还不是朋友!');
            }
        });

    };


}]);