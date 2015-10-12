/**
 * Created by linyong on 2015/7/7.
 */
'use strict';
/*global angular*/

angular.module('YDD')
    .filter('checkName', ['JSONKit',
        /**
         * @description 检查用户名字符串是否符合规范
         * @param JSONKit
         * @returns {Function}
         */
            function (JSONKit) {
            return function (text) {
                var reg = /^[(\u4e00-\u9fa5)a-z][(\u4e00-\u9fa5)a-zA-Z0-9_]{1,}$/;
                text = JSONKit.toStr(text);
                return reg.test(text);
            };
        }
    ])//检查用户名字符串是否符合规范
    .filter('cutText', ['utf8', 'JSONKit',
        /**
         *
         * @param utf8
         * @param JSONKit
         * @returns {Function}
         */
            function (utf8, JSONKit) {
            return function (text, len) {
                text = JSONKit.toStr(text).trim();
                var bytes = utf8.stringToBytes(text);
                len = len > 0 ? len : 0;
                if (bytes.length > len) {
                    bytes.length = len;
                    text = utf8.bytesToString(bytes);
                    text = text.slice(0, -2) + '…';
                }
                return text;
            };
        }
    ])//截取字符串长度，并追加...
    .filter('cutTextCn', ['utf8', 'JSONKit',
        function (utf8, JSONKit) {
            return function (text, length) {


                var strLen = function () {
                    var len = 0;
                    for (var i = 0; i < text.length; i++) {
                        if (text.charCodeAt(i) > 255 || text.charCodeAt(i) < 0) len += 2; else len++;
                    }
                    return len;
                }
//将字符串拆成字符，并存到数组中
                var strToChars = function () {
                    var chars = new Array();
                    for (var i = 0; i < text.length; i++) {
                        chars[i] = [text.substr(i, 1), isCHS(i)];
                    }

                    return chars;
                }

                //判断某个字符是否是汉字
                var isCHS = function (i) {
                    if (text.charCodeAt(i) > 255 || text.charCodeAt(i) < 0)
                        return true;
                    else
                        return false;
                }


                var subCHString = function (start, end) {
                    var len = 0;
                    var str = "";
                    var chars = strToChars();
                    for (var i = 0; i < text.length; i++) {
                        if (chars[i][1])
                            len += 2;
                        else
                            len++;
                        if (end < len)
                            return str;
                        else if (start < len)
                            str += chars[i][0];
                    }
                    return str;
                }
                var llength = strLen();
                if (llength > length) {
                    text = subCHString(0, length) + '...';
                }

                return text;
                /* text = JSONKit.toStr(text).trim();
                 var bytes = utf8.stringToBytes(text);
                 len = len > 0 ? len : 0;
                 if (bytes.length > len) {
                 bytes.length = len;
                 text = utf8.bytesToString(bytes);
                 text = text.slice(0, -2) + '…';
                 }
                 return text;*/
            };
        }
    ])//截取中文字符串长途
    .filter('formatBytes', ['$locale',
        function ($locale) {
            return function (bytes) {
                bytes = bytes > 0 ? bytes : 0;
                if (!bytes) {
                    return '-';
                } else if (bytes < 1024) {
                    return bytes + 'B';
                } else if (bytes < 1048576) {
                    return (bytes / 1024).toFixed(3) + ' KiB';
                } else if (bytes < 1073741824) {
                    return (bytes / 1048576).toFixed(3) + ' MiB';
                } else {
                    return (bytes / 1073741824).toFixed(3) + ' GiB';
                }
            };
        }
    ])//
    .filter('formatDate', ['$filter', '$locale',
        function ($filter, $locale) {
            return function (date, full) {
                var o = Date.now() - date,
                    dateFilter = $filter('date');
                if (full) {
                    return dateFilter(date, $locale.DATETIME.fullD);
                } else if (o > 259200000) {
                    return dateFilter(date, $locale.DATETIME.shortD);
                } else if (o > 86400000) {
                    return Math.floor(o / 86400000) + $locale.DATETIME.dayAgo;
                } else if (o > 3600000) {
                    return Math.floor(o / 3600000) + $locale.DATETIME.hourAgo;
                } else if (o > 60000) {
                    return Math.floor(o / 60000) + $locale.DATETIME.minuteAgo;
                } else {
                    return $locale.DATETIME.secondAgo;
                }
            };
        }
    ])//
    .filter('formatTime', ['$locale',
        function ($locale) {
            return function (seconds) {
                var re = '',
                    q = 0,
                    o = seconds > 0 ? Math.round(+seconds) : Math.floor(Date.now() / 1000),
                    TIME = $locale.DATETIME;

                function calculate(base) {
                    q = o % base;
                    o = (o - q) / base;
                    return o;
                }

                calculate(60);
                re = q + TIME.second;
                calculate(60);
                re = (q > 0 ? (q + TIME.minute) : '') + re;
                calculate(24);
                re = (q > 0 ? (q + TIME.hour) : '') + re;
                return o > 0 ? (o + TIME.day + re) : re;
            };
        }
    ])//
    .filter('length', ['utf8', 'JSONKit',
        function (utf8, JSONKit) {
            return function (text) {
                text = JSONKit.toStr(text);
                return utf8.stringToBytes(text).length;
            };
        }
    ])//
    .filter('match', ['$locale',
        function ($locale) {
            return function (value, type) {
                return $locale.FILTER[type] && $locale.FILTER[type][value] || '';
            };
        }
    ])//
    .filter('placeholder', ['JSONKit',
        function (JSONKit) {
            return function (str) {
                return JSONKit.toStr(str) || '-';
            };
        }
    ])//
    .filter('switch', ['$locale',
        function ($locale) {
            return function (value, type) {
                return $locale.FILTER[type] && $locale.FILTER[type][+!!value] || '';
            };
        }
    ])//
    .filter('tenBit',function () {
        return function (text) {
            text = '' + text;
            text = text.length > 1 ? text : '0' + text;
            return text;
        };
    })//
    .filter('toHtml', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        }
    }])
;