/**
 * Created by linyong on 2015/7/7.
 */
'use strict';
angular.module('YDD')
    .factory('anchorScroll', function () {
        function toView(element, top, height) {
            var winHeight = $(window).height();
            element = $(element);
            height = height > 0 ? height : winHeight / 10;
            $('html, body').animate({
                scrollTop: top ? (element.offset().top - height) : (element.offset().top + element.outerHeight() + height - winHeight)
            }, {
                duration: 200,
                easing: 'linear',
                complete: function () {
                    if (!inView(element)) {
                        element[0].scrollIntoView(!!top);
                    }
                }
            });
        }

        function inView(element) {
            element = $(element);

            var win = $(window),
                winHeight = win.height(),
                eleTop = element.offset().top,
                eleHeight = element.outerHeight(),
                viewTop = win.scrollTop(),
                viewBottom = viewTop + winHeight;

            function isInView(middle) {
                return middle > viewTop && middle < viewBottom;
            }

            if (isInView(eleTop + (eleHeight > winHeight ? winHeight : eleHeight) / 2)) {
                return true;
            } else if (eleHeight > winHeight) {
                return isInView(eleTop + eleHeight - winHeight / 2);
            } else {
                return false;
            }
        }

        return {
            toView: toView,
            inView: inView
        };
    })//
    .factory('applyFn', ['$rootScope',
        function ($rootScope) {
            return function (fn, scope) {
                fn = angular.isFunction(fn) ? fn : angular.noop;
                scope = scope && scope.$apply ? scope : $rootScope;
                fn();
                if (!scope.$$phase) {
                    scope.$apply();
                }
            };
        }
    ])//
    .factory('cache', ['$cacheFactory',
        function ($cacheFactory) {
            return {
                user: $cacheFactory('user', {
                    capacity: 20
                })
            };
        }
    ])//
    .factory('CryptoJS', function () {
        return window.CryptoJS;
    })//
    .factory('isVisible', function () {
        return function (element) {
            var rect = element[0].getBoundingClientRect();
            return Boolean(rect.bottom - rect.top);
        };
    })//
    .factory('JSONKit', function () {
        return window.JSONKit;
    })//
    .factory('myConf', ['$cookieStore', 'JSONKit',
        function ($cookieStore, JSONKit) {
            function checkValue(value, defaultValue) {
                return value == null ? defaultValue : value;
            }

            function myCookies(name, initial) {
                /**
                 * @value 重新设置分页页面大小的值，默认为Null，将不重置
                 */
                return function (value, pre, defaultValue) {
                    pre = JSONKit.toStr(pre) + name;
                    defaultValue = checkValue(defaultValue, initial);//如果未传入默认页面大小，将采用系统默认页面大小
                    var result = checkValue($cookieStore.get(pre), defaultValue);//在cookie中取回默认页面大小
                    if ((value != null) && result !== checkValue(value, defaultValue)) {
                        $cookieStore.put(pre, value);//重新保存默认页面大小
                        result = value;
                    }
                    return result;
                };
            }

            return {
                pageSize: myCookies('PageSize', 5),
                sumModel: myCookies('sumModel', false)
            };
        }
    ])//
    .factory('param', function () {
        // return $.param;
        return function (params) {
            if (typeof(params) !== 'object') {
                return "";
            } else {
                var str = "";
                for (var key in params) {
                    str += key + '=' + params[key] + '&';
                }
                str += 'v=' + new Date().getTime();
                return str;
            }

        };
    })//
    .factory('promiseGet', ['$q',
        function ($q) {
            return function (param, restAPI, cacheId, cache) {
                var result, defer = $q.defer();

                result = cacheId && cache && cache.get(cacheId);//尝试从本地缓存中读取数据

                if (result) {
                    defer.resolve(result);
                } else {
                    restAPI.get(param, function (data) {
                        if (cacheId && cache) {
                            cache.put(cacheId, data);//将数据写入本地缓存
                        }
                        defer.resolve(data);
                    }, function (data) {
                        defer.reject(data.error);
                    });
                }
                return defer.promise;
            };
        }
    ])//
    .factory('store', function () {
        return window.store;
    })//
    .factory('_', function () {
        return window._;
    })//
    .factory('timing', ['$rootScope', '$q', '$exceptionHandler',
        function ($rootScope, $q, $exceptionHandler) {
            function timing(fn, delay, times) {
                var timingId, count = 0,
                    defer = $q.defer(),
                    promise = defer.promise;

                fn = angular.isFunction(fn) ? fn : angular.noop;
                delay = parseInt(delay, 10);
                times = parseInt(times, 10);
                times = times >= 0 ? times : 0;
                timingId = window.setInterval(function () {
                    count += 1;
                    if (times && count >= times) {
                        window.clearInterval(timingId);
                        defer.resolve(fn(count, times, delay));
                    } else {
                        try {
                            fn(count, times, delay);
                        } catch (e) {
                            defer.reject(e);
                            $exceptionHandler(e);
                        }
                    }
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                }, delay);

                promise.$timingId = timingId;
                return promise;
            }

            timing.cancel = function (promise) {
                if (promise && promise.$timingId) {
                    clearInterval(promise.$timingId);
                    return true;
                } else {
                    return false;
                }
            };
            return timing;
        }
    ])//
    .factory('utf8', function () {
        return window.utf8;
    })
    .factory('yddUIConfirm',['$modal',function($modal){
        return function(title,msg,cb){
            var modalInstance = $modal.open({
                animation:true,
                templateUrl: '/servertpl/yddUIConfirm.html',
                controller: "yddUIConfirmCtrl",
                size: "sm",
                resolve: {
                    title: function () {
                        return title;
                    },
                    msg: function () {
                        return msg;
                    }
                }
            });
            modalInstance.result.then(function () {
                cb();
            }, function () {
            });
        };
    }]).controller("yddUIConfirmCtrl",function ($scope, $modalInstance, title, msg) {
        $scope.title = title;
        $scope.msg = msg;
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });