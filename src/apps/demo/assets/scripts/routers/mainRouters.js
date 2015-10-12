/**
 * Created by LinYong on 2014/8/21.
 */


angular.module('YDD').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'getFileProvider',

  function ($stateProvider,$urlRouterProvider, $locationProvider, getFileProvider) {
    var index = {
        url: '/',
        templateUrl: getFileProvider.html('index.html'),
        controller: 'indexCtrl'
        },
        about = {
            url: '/about',
            templateUrl: getFileProvider.html('about.html'),
            controller: 'aboutCtrl'
        },
        form={
            url: '/form',
            templateUrl: getFileProvider.html('form.html'),
            controller: 'formCtrl'
        },
        form_profile={
            url: '/profile',
            templateUrl: getFileProvider.html('form-profile.html')
        },
      form_interests={
          url: '/interests',
          templateUrl:  getFileProvider.html('form-interests.html')
      },
        form_payment={
            url: '/payment',
            templateUrl:  getFileProvider.html('form-payment.html')
      }
        ;
      $stateProvider
          .state('index',index)
          .state('about',about)
          // route to show our basic form (/form)
          .state('form',form)

          // nested states
          // each of these sections will have their own view
          // url will be nested (/form/profile)
          .state('form.profile', form_profile)

          // url will be /form/interests
          .state('form.interests',form_interests )

          // url will be /form/payment
          .state('form.payment', form_payment);

      // catch all route
      // send users to the form page
      $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]);
