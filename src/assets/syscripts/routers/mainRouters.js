/**
 * Created by LinYong on 2014/8/21.
 */


angular.module('YDD').config(['$routeProvider', '$locationProvider', 'getFileProvider',

  function ($routeProvider, $locationProvider, getFileProvider) {
    var index = {
        templateUrl: getFileProvider.serverhtml('index.html'),
        controller: 'indexCtrl'
      }
      ;

    $routeProvider.when('/hots', index).
      when('/update', index).
      when('/latest', index).
      when('/A/:ID/:OP', index).
      when('/', index).
        otherwise({
          redirectTo: '/'
        });
    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]);
