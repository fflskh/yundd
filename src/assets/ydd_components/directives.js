/**
 * Created by linyong on 2015/7/7.
 */
'use strict';

angular.module('YDD')
    .directive('onFinishRenderFilters', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var listenName = attr.listen || 'ngRepeatFinished';
                listenName = listenName.split(",");
                if (scope.$last === true) {
                    $timeout(function () {
                        for (var i = 0; i < listenName.length; i++) {
                            scope.$emit(listenName[i]);
                        }
                    }, 500);
                }
            }
        };
    }])//
    .directive('formatDate', ['isVisible', '$filter',
        function (isVisible, $filter) {
            return {
                require: 'ngModel',
                link: function (scope, elem, attr, ngModelCtrl) {
                    ngModelCtrl.$formatters.push(function (modelValue) {
                        if (modelValue) {
                            return new Date(modelValue);
                        }
                    });

                    ngModelCtrl.$parsers.push(function (value) {
                        if (value) {
                            return $filter('date')(value, 'yyyy-MM-dd');
                        }
                    });
                }
            }
        }

    ])//
    .directive('genModal', ['getFile', '$timeout',
        function (getFile, $timeout) {
            //<div gen-modal="msgModal">[body]</div>
            // scope.msgModal = {
            //     id: 'msg-modal',    [option]
            //     title: 'message title',    [option]
            //     width: 640,    [option]
            //     confirmBtn: 'confirm button name',    [option]
            //     confirmFn: function () {},    [option]
            //     cancelBtn: 'cancel button name',    [option]
            //     cancelFn: function () {}    [option]
            //     deleteBtn: 'delete button name',    [option]
            //     deleteFn: function () {}    [option]
            // };
            var uniqueModalId = 0;
            return {
                scope: true,
                transclude: true,
                templateUrl: getFile.html('gen-modal.html'),
                link: function (scope, element, attr) {
                    var modalStatus,
                        modalElement = element.children(),
                        list = ['Confirm', 'Cancel', 'Delete'],
                        options = scope.$eval(attr.genModal),
                        isFunction = angular.isFunction;

                    function wrap(fn) {
                        return function () {
                            var value = isFunction(fn) ? fn() : true;
                            showModal(!value);
                        };
                    }

                    function resize() {
                        var jqWin = $(window),
                            element = modalElement.children(),
                            top = (jqWin.height() - element.outerHeight()) * 0.382,
                            css = {};

                        css.marginTop = top > 0 ? top : 0;
                        element.css(css);
                    }

                    function showModal(value) {
                        modalElement.modal(value ? 'show' : 'hide');
                        if (value) {
                            $timeout(resize);
                        }
                    }

                    options.cancelFn = options.cancelFn || true;
                    options.backdrop = options.backdrop || true;
                    options.show = options.show || false;
                    options.modal = showModal;

                    scope.$watch(function () {
                        return options;
                    }, function (value) {
                        angular.extend(scope, value);
                    }, true);

                    scope.id = scope.id || attr.genModal + '-' + (uniqueModalId++);
                    angular.forEach(list, function (name) {
                        var x = name.toLowerCase(),
                            cb = x + 'Cb',
                            fn = x + 'Fn',
                            btn = x + 'Btn';
                        scope[cb] = options[fn] && wrap(options[fn]);
                        scope[btn] = options[btn] || (options[fn] && name);
                    });

                    modalElement.on('shown.bs.modal', function (event) {
                        modalStatus = true;
                    });
                    modalElement.on('hidden.bs.modal', function (event) {
                        if (modalStatus && isFunction(options.cancelFn)) {
                            options.cancelFn(); // when hide by other way, run cancelFn;
                        }
                        modalStatus = false;
                    });
                    modalElement.modal(options);
                }
            };
        }
    ])//
    .directive('genPagination', ['getFile',
        function (getFile) {
            // <div gen-pagination="options"></div>
            // HTML/CSS修改于Bootstrap框架
            // options = {
            //     path: 'pathUrl',
            //     sizePerPage: [25, 50, 100],
            //     pageSize: 25,
            //     pageIndex: 1,
            //     total: 10
            // };
            return {
                scope: true,
                templateUrl: getFile.serDirectiveHtml('gen-pagination.html'),
                link: function (scope, element, attr) {
                    scope.$watchCollection(attr.genPagination, function (value) {
                        if (!angular.isObject(value)) {
                            return;
                        }
                        var pageIndex = 1,
                            showPages = [],
                            lastPage = Math.ceil(value.total / value.pageSize) || 1;

                        pageIndex = value.pageIndex >= 1 ? value.pageIndex : 1;
                        pageIndex = pageIndex <= lastPage ? pageIndex : lastPage;

                        showPages[0] = pageIndex;
                        if (pageIndex <= 6) {
                            while (showPages[0] > 1) {
                                showPages.unshift(showPages[0] - 1);
                            }
                        } else {
                            showPages.unshift(showPages[0] - 1);
                            showPages.unshift(showPages[0] - 1);
                            showPages.unshift('…');
                            showPages.unshift(2);
                            showPages.unshift(1);
                        }

                        if (lastPage - pageIndex <= 5) {
                            while (showPages[showPages.length - 1] < lastPage) {
                                showPages.push(showPages[showPages.length - 1] + 1);
                            }
                        } else {
                            showPages.push(showPages[showPages.length - 1] + 1);
                            showPages.push(showPages[showPages.length - 1] + 1);
                            showPages.push('…');
                            showPages.push(lastPage - 1);
                            showPages.push(lastPage);
                        }

                        scope.prev = pageIndex > 1 ? pageIndex - 1 : 0;
                        scope.next = pageIndex < lastPage ? pageIndex + 1 : 0;
                        scope.total = value.total;
                        scope.pageIndex = pageIndex;
                        scope.showPages = showPages;
                        scope.pageSize = value.pageSize;
                        value.sizePerPage = value.sizePerPage || [6, 10, 20, 50];
                        scope.perPages = value.sizePerPage || [6, 10, 20, 50];
                        scope.path = value.path && value.path + '?p=';
                    });
                    scope.paginationTo = function (p, s) {
                        if (!scope.path && p > 0) {
                            s = s || scope.pageSize;
                            scope.$emit('genPagination', p, s);
                        }
                    };
                }
            };
        }
    ])//
    .directive('uiPagination', ['getFile', '$state', '$stateParams',
        function (getFile, $state, $stateParams) {
            return {
                scope: true,
                templateUrl: getFile.serDirectiveHtml('ui-pagination.html'),
                link: function (scope, element, attr) {
                    scope.$watchCollection(attr.uiPagination, function (value) {
                        if (!angular.isObject(value)) {
                            return;
                        }
                        var pageIndex = 1,
                            showPages = [],
                            lastPage = Math.ceil(value.total / value.pageSize) || 1;

                        pageIndex = value.pageIndex >= 1 ? value.pageIndex : 1;
                        pageIndex = pageIndex <= lastPage ? pageIndex : lastPage;

                        showPages[0] = pageIndex;
                        if (pageIndex <= 6) {
                            while (showPages[0] > 1) {
                                showPages.unshift(showPages[0] - 1);
                            }
                        } else {
                            showPages.unshift(showPages[0] - 1);
                            showPages.unshift(showPages[0] - 1);
                            showPages.unshift('…');
                            showPages.unshift(2);
                            showPages.unshift(1);
                        }

                        if (lastPage - pageIndex <= 5) {
                            while (showPages[showPages.length - 1] < lastPage) {
                                showPages.push(showPages[showPages.length - 1] + 1);
                            }
                        } else {
                            showPages.push(showPages[showPages.length - 1] + 1);
                            showPages.push(showPages[showPages.length - 1] + 1);
                            showPages.push('…');
                            showPages.push(lastPage - 1);
                            showPages.push(lastPage);
                        }

                        scope.prev = pageIndex > 1 ? pageIndex - 1 : 0;
                        scope.next = pageIndex < lastPage ? pageIndex + 1 : 0;
                        scope.total = value.total;
                        scope.pageIndex = pageIndex;
                        scope.showPages = showPages;
                        scope.pageSize = value.pageSize;
                        value.sizePerPage = value.sizePerPage || [5, 10, 20, 50];
                        scope.perPages = value.sizePerPage || [5, 10, 20, 50];
                        scope.path = value.path && value.path + '?p=';
                    });
                    scope.paginationTo = function (p, s) {
                        //console.log('paginationTo:',p,s,$state.current,$state.params);
                        //console.log('$state.params:',$state.params);
                        if (p > 0) {
                            s = s || scope.pageSize;
                            $state.go($state.current, {p: p, s: s});
                            scope.$emit('uiPagination', p, s);
                        }
                    };
                }
            };
        }])//基于UI-ROUTER的分页方式
    .directive('genSrc', ['isVisible',
        function (isVisible) {
            return {
                priority: 99,
                link: function (scope, element, attr) {
                    attr.$observe('genSrc', function (value) {
                        if (value && isVisible(element)) {
                            var img = new Image();
                            img.onload = function () {
                                attr.$set('src', value);
                            };
                            img.src = value;
                        }
                    });
                }
            };
        }
    ])//
    .directive('genTabClick', function () {
        //<ul>
        //<li gen-tab-click="className"></li>
        //<li gen-tab-click="className"></li>
        //</ul>
        // 点击li元素时，该元素将赋予className类，并移除其它兄弟元素的className类
        return {
            link: function (scope, element, attr) {
                var className = attr.genTabClick;
                element.bind('click', function () {
                    element.parent().children().removeClass(className);
                    element.addClass(className);
                });
            }
        };
    })//
    .directive('genTooltip', ['$timeout', 'isVisible',
        function ($timeout, isVisible) {
            //<div data-original-title="tootip title" gen-tooltip="tootipOption"></div>
            // tootipOption = {
            //     validate: false, // if true, use for AngularJS validation
            //     validateMsg : {
            //         required: 'Required!',
            //         minlength: 'Too short!'
            //     }
            //     ...other bootstrap tooltip options
            // }
            return {
                require: '?ngModel',
                link: function (scope, element, attr, ctrl) {
                    var enable = false,
                        option = scope.$eval(attr.genTooltip) || {};
                    if (DEBUG) {
                        console.log(option);
                    }

                    function invalidMsg(invalid) {
                        ctrl.validate = enable && option.validate && isVisible(element);
                        if (ctrl.validate) {
                            var title = (ctrl.$name && ctrl.$name + ' ') || '';
                            if (invalid && option.validateMsg) {
                                angular.forEach(ctrl.$error, function (value, key) {
                                    title += (value && option.validateMsg[key] && option.validateMsg[key] + ', ') || '';
                                });
                            }
                            title = title.slice(0, -2) || attr.originalTitle || attr.title;
                            attr.$set('dataOriginalTitle', title ? title : '');
                            showTooltip(!!invalid);
                        } else {
                            showTooltip(false);
                        }
                    }

                    function validateFn(value) {
                        $timeout(function () {
                            invalidMsg(ctrl.$invalid);
                        });
                        return value;
                    }

                    function initTooltip() {
                        element.off('.tooltip').removeData('bs.tooltip');
                        // element.tooltip(option);
                    }

                    function showTooltip(show) {
                        if (element.hasClass('invalid-error') !== show) {
                            element[show ? 'addClass' : 'removeClass']('invalid-error');
                            // element.tooltip(show ? 'show' : 'hide');
                        }
                    }

                    if (option.container === 'inner') {
                        option.container = element;
                    } else if (option.container === 'ngView') {
                        option.container = element.parents('.ng-view')[0] || element.parents('[ng-view]')[0];
                    }
                    // use for AngularJS validation
                    if (option.validate) {
                        option.template = '<div class="tooltip validate-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';
                        option.trigger = 'manual';
                        option.placement = option.placement || 'right';
                        if (ctrl) {
                            ctrl.$formatters.push(validateFn);
                            ctrl.$parsers.push(validateFn);
                        } else {
                            scope.$watch(function () {
                                return attr.originalTitle || attr.dataOriginalTitle;
                            }, showTooltip);
                        }
                        element.bind('focus', function () {
                            // element.trigger('input');
                            //  element.trigger('change');
                        });
                        scope.$on('genTooltipValidate', function (event, collect, turnoff) {
                            enable = !turnoff;
                            if (ctrl) {
                                if (angular.isArray(collect)) {
                                    collect.push(ctrl);
                                }
                                invalidMsg(ctrl.$invalid);
                            }
                        });
                    } else if (option.click) {
                        // option.click will be 'show','hide','toggle', or 'destroy'
                        element.bind('click', function () {
                            //  element.tooltip(option.click);
                        });
                    }

                    element.bind('hidden.bs.tooltip', initTooltip);
                    initTooltip();
                }
            };
        }
    ])//
    .directive('genUeditor', ['isVisible', '$filter', function (isVisible, $filter) {
        return {
            restrict: "C",
            require: "ngModel",
            scope: {
                config: "=",
                ready: "="
            },
            link: function ($S, element, attr, ctrl) {
                var _NGUeditor, _updateByRender;
                _updateByRender = false;
                _NGUeditor = (function () {
                    function _NGUeditor() {
                        this.bindRender();
                        this.initEditor();
                        return;
                    }


                    /**
                     * 初始化编辑器
                     * @return {[type]} [description]
                     */

                    _NGUeditor.prototype.initEditor = function () {
                        var _UEConfig, _editorId, _self;
                        _self = this;
                        if (typeof UE === 'undefined') {
                            if (DEBUG) {
                                console.error("Please import the local resources of ueditor!");
                            }

                            return;
                        }
                        _UEConfig = $S.config ? $S.config : {};
                        _editorId = attr.id ? attr.id : "_editor" + (Date.now());
                        element[0].id = _editorId;
                        this.editor = new UE.getEditor(_editorId, _UEConfig);
                        return this.editor.ready(function () {
                            _self.editorReady = true;
                            _self.editor.addListener("contentChange", function () {
                                ctrl.$setViewValue(_self.editor.getContent());
                                if (!_updateByRender) {
                                    if (!$S.$$phase) {
                                        $S.$apply();
                                    }
                                }
                                _updateByRender = false;
                            });
                            if (_self.modelContent.length > 0) {
                                _self.setEditorContent();
                            }
                            if (typeof $S.ready === "function") {
                                $S.ready(_self.editor);
                            }
                        });
                    };

                    _NGUeditor.prototype.setEditorContent = function (content) {
                        if (content == null) {
                            content = this.modelContent;
                        }
                        if (this.editor && this.editorReady) {
                            this.editor.setContent(content);
                        }
                    };

                    _NGUeditor.prototype.bindRender = function () {
                        var _self;
                        _self = this;
                        ctrl.$render = function () {
                            _self.modelContent = (ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
                            _updateByRender = true;
                            _self.setEditorContent();
                        };
                    };

                    return _NGUeditor;

                })();
                new _NGUeditor();
            }
        };
    }
    ])//完整的Ueditor
    .directive('genUeditorImage', ['isVisible', '$filter', function (isVisible, $filter) {
        return {
            restrict: "C",
            require: "ngModel",
            scope: {
                config: "=",
                ready: "="
            },
            link: function ($S, element, attr, ctrl) {
                var _NGUeditor, _updateByRender;
                _updateByRender = false;
                _NGUeditor = (function () {
                    function _NGUeditor() {
                        this.initEditor();
                        return;
                    }

                    /**
                     * 初始化编辑器
                     * @return {[type]} [description]
                     */
                    _NGUeditor.prototype.initEditor = function () {
                        var _UEConfig, _editorId, _self;
                        _self = this;
                        if (typeof UE === 'undefined') {
                            if (DEBUG) {
                                console.error("Please import the local resources of ueditor!");
                            }

                            return;
                        }
                        _UEConfig = $S.config ? $S.config : {};
                        _editorId = attr.id ? attr.id : "_editor" + (Date.now());
                        element[0].id = _editorId;
                        this.editor = new UE.getEditor(_editorId, _UEConfig);
                        return this.editor.ready(function () {
                            _self.editorReady = true;
                            //设置编辑器不可用
                            _self.editor.setDisabled(['insertimage', 'attachment']);
                            //隐藏编辑器，因为不会用到这个编辑器实例，所以要隐藏
                            _self.editor.hide();
                            //侦听图片上传
                            _self.editor.addListener('beforeInsertImage', function (t, arg) {
                                //将地址赋值给相应的input,只去第一张图片的路径
                                //alert(arg[0].src);
                                ctrl.$setViewValue(arg[0].src);
                                if (!_updateByRender) {
                                    if (!$S.$$phase) {
                                        $S.$apply();
                                    }
                                }
                                _updateByRender = false;
                                $S.$emit('ImgesUploadOver', {images: arg});
                            });
                            //侦听文件上传，取上传文件列表中第一个上传的文件的路径
                            //要让本功能生效需要修改原uedior代码，在uedior/dialogs/attment目录下修改attment.js 增加 editor.fireEvent('afterUpfile', list);
                            _self.editor.addListener('afterUpfile', function (t, arg) {
                                //alert(_editor.options.filePath + arg[0].url);
                                //$("#file").attr("value", arg[0].url);
                                //$("#filename").val(arg[0].title);
                            });
                            if (typeof $S.ready === "function") {
                                $S.ready(_self.editor);
                            }
                        });
                    };

                    return _NGUeditor;

                })();
                new _NGUeditor();
            }
        };
    }])//Ueditor 上传图片
    .directive('genUploader', ['getFile', 'FileUploader', 'app', function (getFile, FileUploader, app) {
        // <div gen-pagination="options"></div>
        // HTML/CSS修改于Bootstrap框架
        // options = {
        //     path: 'pathUrl',
        //     sizePerPage: [25, 50, 100],
        //     pageSize: 25,
        //     pageIndex: 1,
        //     total: 10
        // };
        return {
            scope: true,
            templateUrl: getFile.html('gen-uploader.html'),
            link: function (scope, element, attr) {
                var options = scope.$eval(attr.genUploader);
                var fileType = options.fileType;
                scope.triggerUpload = function () {
                    setTimeout(function () {
                        element.find('.upload-input').click();
                    });
                };
                scope.clickImage = options.clickImage || angular.noop;
                var uploaded = scope.uploaded = [];

                // create a uploader with options
                var uploader = scope.uploader = FileUploader.create({
                    scope: options.scope || scope,
                    url: options.url,
                    formData: [
                        {
                            policy: options.policy,
                            signature: options.signature
                        }
                    ],
                    filters: [
                        function (file) {
                            var judge = true,
                                parts = file.name.split('.');
                            parts = parts.length > 1 ? parts.slice(-1)[0] : '';
                            if (!parts || options.allowFileType.indexOf(parts.toLowerCase()) < 0) {
                                judge = false;
                                app.toast.warning(app.locale.UPLOAD.fileType);
                            }
                            return judge;
                        }
                    ]
                });

                uploader.bind('complete', function (event, xhr, item) {
                    var response = app.parseJSON(xhr.response) || {};
                    if (~[200, 201].indexOf(xhr.status)) {
                        var file = app.union(item.file, response);
                        file.url = options.baseUrl + file.url;
                        uploaded.push(file);
                        item.remove();
                    } else {
                        item.progress = 0;
                        app.toast.warning(response.message, response.code);
                    }
                });
            }
        };
    }
    ])//
    .directive('rdLoading', function () {
        var directive = {
            restrict: 'AE',
            template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
        };
        return directive;
    }).directive('resize', function ($window) {
        return function (scope, element, attr) {
            var w = angular.element($window);
            scope.$watch(function () {
                return {
                    'h': window.innerHeight,
                    'w': window.innerWidth
                };
            }, function (newValue, oldValue) {
                if (DEBUG) {
                    console.log(newValue, oldValue);
                }
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
                scope.$eval(attr.notifier)(element,newValue);
                scope.resizeHeightOffset = function (offsetH) {
                   // scope.$eval(attr.notifier);
                    return {
                        'height': (newValue.h - offsetH) + 'px'
                    };
                };
                scope.resizeWithOffset = function (offsetW) {
                    //scope.$eval(attr.notifier);
                    return {
                        'width': (newValue.w - offsetW) + 'px'
                    };
                };

            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    });