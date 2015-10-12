/**
 * Created by LinYong on 2014/10/24.
 */
'use strict';
angular.module('YDD').controller('indexCtrl', ['app', '$scope', '$routeParams', 'ngDialog','$timeout','_',
  function (app, $scope, $routeParams, ngDialog,$timeout,_) {
      var a=[1,2,3,4,5,6,7,8,9,10];
      $scope.data={};
      $scope.data.a= _.last(a);

      // 设置数据
      $scope.bigData = {};

      $scope.bigData.breakfast = false;
      $scope.bigData.lunch = false;
      $scope.bigData.dinner = false;

      // COLLAPSE =====================
      $scope.isCollapsed = false;

  }]);
