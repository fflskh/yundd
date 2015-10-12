/**
 * Created by linyong on 2015/7/7.
 */
'use strict';
/*global angular, marked, Sanitize, Markdown, prettyPrint, toastr, CryptoJS, utf8, store, JSONKit*/

angular.module('YDD').factory('restAPI', ['$resource',
    function ($resource) {
        return {
            index: $resource('/index/:ID/:OP')
        };
    }
]);