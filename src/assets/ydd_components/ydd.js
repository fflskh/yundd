/**
 * Created by linyong on 2015/7/7.
 */
angular.module('YDD', [ 'ngLocale',
        'ngRoute',
        'ngAnimate',
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'ui.validate',
        'ngFileUpload',
        'pascalprecht.translate',
        'ngDialog']
)
    //添加全局变量app
    .constant('app', {
        toggle: false,
        version: Date.now()
    })
    //获取模板数据
    .provider('getFile', ['app',
        function (app) {
            this.html = function (fileName) {
                return 'templates/' + fileName + '?v=' + app.version;
            };
            this.serverhtml = function (fileName) {
                return 'servertpl/' + fileName + '?v=' + app.version;
            };
            this.serDirectiveHtml = function (fileName) {
                return 'servertpl/directives/' + fileName + '?v=' + app.version;
            };
            this.$get = function () {
                return {
                    html: this.html,
                    serverhtml: this.serverhtml,
                    serDirectiveHtml:this.serDirectiveHtml
                };
            };
        }
    ])
    //定义全局http请求
    .config(['$httpProvider', 'app',
        function ($httpProvider, app) {
            // global loading status
            var count = 0,
                loading = false,
                status = {
                    count: 0,
                    total: 0
                };

            status.cancel = function () {
                count = 0;
                loading = false;
                this.count = 0;
                this.total = 0;
                app.loading(false, this); // end loading
            };

            // global loading start
            $httpProvider.defaults.transformRequest.push(function (data) {
                count += 1;
                status.count = count;
                status.total += 1;
                if (!loading) {
                    window.setTimeout(function () {
                        if (!loading && count > 0) {
                            loading = true;
                          //  app.loading(true, status);
                        }
                    }, 1000); // if no response in 1000ms, begin loading
                }
                return data;
            });
            // global loading end
            $httpProvider.defaults.transformResponse.push(function (data) {
                count -= 1;
                status.count = count;
                if (loading && count === 0) {
                    status.cancel();
                }
                return data;
            });
            // global error handling
            $httpProvider.interceptors.push(function () {
                return {
                    response: function (res) {
                        var error, data = res.data;
                        if (angular.isObject(data)) {
                            app.timestamp = data.timestamp;
                            error = !data.ack && data.error;
                        }

                        if (error) {
                            app.addAlert({type:'danger',msg:error.name+":"+error.message,timeout:5000});
                            return app.q.reject(data);
                        } else {
                            return res;
                        }
                    },
                    responseError: function (res) {
                        var data = res.data || res,
                            status = res.status || '',
                            message = data.message || (angular.isObject(data) ? 'Error!' : data);
                        app.addAlert({type:'danger',msg:status+":"+message,timeout:5000});
                        return app.q.reject(data);
                    }
                };
            });
        }
    ]);