/**
 * Created by LinYong on 2015/7/28.
 * 11366846@qq.com
 */
angular.module('YDD').run(['app', '$q', '$rootScope', '$location', '$timeout', '$filter', 'getFile',
    'JSONKit',  'timing', 'cache', 'restAPI',
    'CryptoJS', 'promiseGet', 'myConf', 'anchorScroll',
    'isVisible', 'applyFn', 'param', 'store', 'i18n-zh', '$window','$state',
    function (app, $q, $rootScope, $location, $timeout, $filter, getFile, JSONKit,timing, cache, restAPI,CryptoJS, promiseGet, myConf,
              anchorScroll, isVisible, applyFn, param, store, $locale, $window,$state) {
        var unSave = {
                stopUnload: false,
                nextUrl: ''
            },
            global = $rootScope.global = {
                isAdmin: false,
                isEditor: false,
                isLogin: false,
                title:"云点点！",
                info: {}
            },
            alerts =  $rootScope.alerts = [];

        app.ui={};
        function resize() {
            var viewWidth = app.ui.viewWidth = window.innerWidth;
            global.viewHeight = window.innerHeight || 500;
            app.ui.viewHeight = window.innerHeight;
            app.ui.isPocket = viewWidth < 480;
            app.ui.isPhone = viewWidth < 768;
            app.ui.isTablet = !app.ui.isPhone && viewWidth < 980;
            app.ui.isDesktop = viewWidth >= 980;
        }

        /*
         @description 通过index API初始化app常量
         */
        function init() {
            var parmas = {
                ID: new Date().getTime(),
                OP:'autologin'
            }
            restAPI.login.get(parmas,function(data){
                if(DEBUG){
                    console.log('login data:',data);
                }

                app.rootScope.user=data.data;
                app.rootScope.authAddr = data.authAddr;

                $rootScope.$on('$stateChangeStart',
                    function (event, toState, toParams, fromState, fromParams) {
                        if(DEBUG){
                            console.log('$stateChangeStart', toState,app.rootScope.user);
                        }

                     /*   if (!app.rootScope.user) {
                            event.preventDefault();
                           // if(app.rootScope.authAddr){
                                $window.location.href = '/';
                           /!* }else{
                                alert(app.rootScope.authAddr + " is not a real addr ");
                            }*!/

                        }*/
                        //event.preventDefault();
                        // transitionTo() promise will be rejected with
                        // a 'transition prevented' error
                    });

            });
        }

        app.q = $q;
        app.store = store;

        app.param = param;
        app.timing = timing;
        app.location = $location;
        app.timeout = $timeout;
        app.timeOffset = 0;
        app.timestamp = Date.now();
        app.filter = $filter;
        app.locale = $locale;
        app.anchorScroll = anchorScroll;
        app.isVisible = isVisible;
        app.getFile = getFile;
        app.cache = cache;
        app.restAPI = restAPI;
        app.CryptoJS = CryptoJS;
        app.promiseGet = promiseGet;
        app.myConf = myConf;
        app.rootScope = $rootScope;
        angular.extend(app, JSONKit); //添加 JSONKit 系列工具函数

        app.loading = function (value, status) {
            // $rootScope.loading = status;
            $rootScope.loading.show = value;
            applyFn();
        };
        app.validate = function (scope, turnoff) {
            var collect = [],
                error = [];
            scope.$broadcast('genTooltipValidate', collect, turnoff);
            app.each(collect, function (x) {
                if (x.validate && x.$invalid) {
                    error.push(x);
                }
            });
            if (error.length === 0) {
                app.validate.errorList = null;
                scope.$broadcast('genTooltipValidate', collect, true);
            } else {
                app.validate.errorList = error;
            }
            return !app.validate.errorList;
        };
        //肮脏数据检查
        app.checkDirty = function (tplObj, pristineObj, Obj) {
            var data = app.union(tplObj);
            if (data && pristineObj && Obj) {
                app.intersect(data, Obj);
                app.each(data, function (x, key, list) {
                    if (angular.equals(x, pristineObj[key])) {
                        delete list[key];
                    }
                });
                app.removeItem(data, undefined);
                unSave.stopUnload = !app.isEmpty(data);//如果数据有变更，标记页面数据有修改
            } else {
                unSave.stopUnload = false;
            }
            return unSave.stopUnload ? data : null;
        };

        app.checkUser = function () {
            global.isLogin = !!global.user;
            global.isAdmin = global.user && global.user.role === 5;
            global.isEditor = global.user && global.user.role >= 4;
        };

        app.clearUser = function () {
            global.user = null;
            app.checkUser();
        };

        app.checkFollow = function (user) {
            var me = global.user || {};
            user.isMe = user._id === me._id;
            user.isFollow = !user.isMe && !!app.findItem(me.followList, function (x) {
                    return x === user._id;
                });
        };

        $rootScope.loading = {
            show: false
        };
        $rootScope.validateTooltip = {
            validate: true,
            validateMsg: $locale.VALIDATE
        };
        $rootScope.unSaveModal = {
            confirmBtn: $locale.BTN_TEXT.confirm,
            confirmFn: function () {
                if (unSave.stopUnload && unSave.nextUrl) {
                    unSave.stopUnload = false;
                    $timeout(function () {
                        window.location.href = unSave.nextUrl;
                    }, 100);
                }
                return true;
            },
            cancelBtn: $locale.BTN_TEXT.cancel,
            cancelFn: true
        };

        $rootScope.goBack = function () {
            window.history.go(-1);
        };
        $rootScope.gohome = function () {
            $window.location.href = "/";
        };

        $rootScope.LogOut = function () {
            var parmas = {
                ID: new Date().getTime(),
                OP: 'logout'
            }
            restAPI.login.save(parmas,{}, function (data) {
                app.rootScope.user=null;
                $window.location.href = "/";
            });
        };

        $rootScope.GoSelect=function(){
            $window.location.href = app.rootScope.authAddr;
        }

        app.addAlert=$rootScope.addAlert = function(msg) {
            $rootScope.alerts.push(msg);
        };

        app.closeAlert=$rootScope.closeAlert = function(index) {
            $rootScope.alerts.splice(index, 1);
        };
        timing(function () { // 保证每360秒内与服务器存在连接，维持session
            if (Date.now() - app.timestamp - app.timeOffset >= 240000) {
                init();
            }
        }, 120000);

        angular.element($window).bind('resize load', resize);
        resize();
        init();

    }
]);