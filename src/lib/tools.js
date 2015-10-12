'use strict';
/*global require, module, Buffer, process, YDD*/

var crypto = require('crypto'),
    msg = require('./msg.js'),
    isArray = Array.isArray,
    breaker = {};

function noop() {
}

// 默认的callback函数模板

function callbackFn(err, doc) {
    return err ? console.log(err) : doc;
}

function wrapCallback(callback) {
    callback = callback || callbackFn;
    return function (err, reply) {
        if (reply === null && err === null) {
            callback(Err('NULL'), null);
        } else {
            callback(err, reply);
        }
    };
}

function errorHandler(cont, err) {
    cont(err);
}
/**
 * @description 比较两个objectid时间部分的大小
 * @param {String} id1
 * @param {String} id2
 * @returns {number} 0 ，<0，>0
 */
function objectIdReverByTime(id1, id2) {
    if (id1 && id2 && id1 !== '' && id2 !== '') {
        console.log('id1:', id1, ',id2:', id2);
        var objId1 = id1.substr(0, 8);
        var objId2 = id2.substr(0, 8);
        var time1 = parseInt(objId1, 16);
        var time2 = parseInt(objId1, 16);
        return time2 - time1;
    } else {
        return 1;
    }

}
//定义YDD的Error对象

function Err(message, name) {
    var err = new Error();
    err.name = name || msg.MAIN.err;
    err.message = message;
    return err;
}
/*
 @description 标准化返回数据结构
 @param {Object} error -错误信息
 @param {Object} data - 返回的数据对象
 @param {Object} pagination - 返回分页信息
 @param {Object} otherObj - 需要返回的额外信息
 @return {Object}
 */
function resJson(error, data, pagination, otherObj) {
    if (error) {
        console.log('resJosn error:', error);
    }
    var result = union({}, otherObj);
    result.ack = !error;
    result.error = error;
    result.timestamp = Date.now();
    result.data = data || null;
    result.pagination = pagination || null;
    return result;
}

function isFunction(fn) {
    return typeof fn === 'function';
}

function parseJSON(str) {
    var obj = null;
    try {
        obj = JSON.parse(str);
    } catch (e) {
    }
    return typeof obj === 'object' ? obj : null;
}

function isNull(obj) {
    return obj == null || obj !== obj;
}

function isEmpty(obj) {
    if (obj) {
        for (var key in obj) {
            return !hasOwn(obj, key);
        }
    }
    return true;
}

function toStr(value) {
    return (value || value === 0) ? (value + '') : '';
}

function toNum(value) {
    if (isArray(value)) {
        each(value, function (x, i) {
            value[i] = +x || 0;
        });
    } else {
        value = +value || 0;
    }
    return value;
}

function toArray(value) {
    if (!isArray(value)) {
        value = value === undefined ? [] : [value];
    }
    return value;
}

function trim(str, strict) {
    return toStr(str).trim().
        replace(strict ? (/\s+/g) : (/ +/g), ' ').
        replace(/^\s+/, '').
        replace(/\s+$/, '');
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function eachProto(obj, iterator, context, arrayLike, right) {

    var i, l, key;
    iterator = iterator || noop;
    if (!obj) {
        return;
    } else if (arrayLike || isArray(obj)) {
        return;
    } else {
        //console.log("OwnProperty:",Object.getOwnPropertyNames(obj)) ;
        console.log("Prototype:", Object.getPrototypeOf(obj));
        for (key in obj) {

            // if (hasOwn(obj, key)) {
            if (obj.propertyIsEnumerable(key)) {
                console.log(key);
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
}
/*
 @description 循环处理数组或对象
 @param {Object | Array} obj - 需要处理的数组或对象
 @param {Function} iterator - 迭代处理函数
 @param {String} context - 上下文
 @param {Boolean} arrayLike - 指定处理数组
 @param {Boolean} right - 从右边开始
 */
function each(obj, iterator, context, arrayLike, right) {
    var i, l, key;
    iterator = iterator || noop;
    if (!obj) {
        return;
    } else if (arrayLike || isArray(obj)) {
        if (!right) {
            for (i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            for (i = obj.length - 1; i >= 0; i--) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        }
    } else {
        for (key in obj) {
            if (hasOwn(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
}

function checkType(obj) {
    var type = typeof obj;
    if (obj === null) {
        return 'null';
    } else if (isArray(obj)) {
        return 'array';
    } else {
        return type;
    }
}
/*
 @description 从一个对象或数组中删除某个属性或项
 @param {Object / Array} list - 要处理的对象或数组
 @item {String} 要删除的项
 @return 成功删除的项数
 */
function removeItem(list, item) {
    var removed = 0;
    if (isArray(list)) {
        each(list, function (x, i) {
            if (x === item) {
                list.splice(i, 1);
                removed += 1;
            }
        }, null, true, true);
    } else {
        each(list, function (x, i) {
            if (x === item) {
                delete list[i];
                removed += 1;
            }
        }, null, false);
    }
    return removed;
}

function extend(dst, src) {
    each(src, function (x, i) {
        dst[i] = x;
    });
    return dst;
}

//深度并集复制，用于数据对象复制、数据对象更新，若同时提供参数 a 对象和 b 对象，则将 b 对象所有属性（原始类型，忽略函数）复制给 a 对象（同名则覆盖），
//返回值为深度复制了 b 后的 a，注意 a 和 b 必须同类型;
//若只提供参数 a，则 union 函数返回 a 的克隆，与JSON.parse(JSON.stringify(a))相比，克隆效率略高。

function union(a, b) {
    var type = checkType(a);

    if (b === undefined) {
        b = a;
        a = type === 'object' ? {} : [];
    }
    if (type === checkType(b)) {
        if (type === 'object' || type === 'array') {
            each(b, function (x, i) {
                var type = checkType(x);
                if (type === 'object' || type === 'array') {
                    a[i] = type === checkType(a[i]) ? a[i] : (type === 'object' ? {} : []);
                    union(a[i], x);
                } else {
                    a[i] = type === 'function' ? null : x;
                }
            });
        } else {
            a = type === 'function' ? null : b;
        }
    }
    return a;
}

//深度交集复制，用于数据对象校验，即以 a 为模板，当a 和 b 共有属性且属性值类型一致时，将 b 的属性值复制给 a，对于 a 有 b 没有或 b 有 a 没有的属性，均删除，返回相交复制后的 a;
// var a = {q:0,w:'',e:{a:0,b:[0,0,0]}}, b = {r:10,w:'hello',e:{a:99,b:[1,2,3,4,5]}};
// intersect(a, b);  // a 变成{w:'hello',e:{a:99,b:[1,2,3]}}
//如果 a 或其属性是 null，则完全复制 b 或其对应属性
//如果 a 或其属性是 {} 或 [], 且 b 或其对应属性类型一致（即对象类型或数组类型），则完全复制
//如果 a 的某属性是数组，且只有一个值，则以该值为模板，将 b 对应的该属性的数组的值校检并复制
// var a = {q:0,w:null,e:{a:0,b:[0]}}, b = {r:10,w:'hello',e:{a:99,b:[function(){},1,2,3,'4',5]}};
// intersect(a, b);  // 注意a与上面的区别
// var a = {q:0,w:null,e:{a:0,b:[null]}}, b = {r:10,w:'hello',e:{a:99,b:[function(){},1,2,3,'4',5]}};
// intersect(a, b);  // 注意a与上面的区别

function intersect(a, b) {
    var type = checkType(a);

    if (type === checkType(b) && (type === 'array' || type === 'object')) {
        if (isEmpty(a)) {
            union(a, b);
        } else if (type === 'array' && a.length === 1) {
            var o = a[0],
                typeK = checkType(o);
            a.length = 0;
            if (typeK !== 'function') {
                each(b, function (x) {
                    var typeB = checkType(x);
                    if (typeK === 'null' || typeK === typeB) {
                        if (typeK === 'object' || typeK === 'array') {
                            a.push(intersect(union(o), x));
                        } else {
                            a.push(union(x));
                        }
                    }
                });
            }
        } else {
            each(a, function (x, i) {
                var typeK = checkType(x);
                if (type === 'array' || hasOwn(b, i)) {
                    if (typeK === 'function' && type === 'array') {
                        a[i] = null;
                    } else if (typeK === 'null') {
                        a[i] = union(b[i]);
                    } else if (typeK === checkType(b[i])) {
                        if (typeK === 'object' || typeK === 'array') {
                            intersect(a[i], b[i]);
                        } else {
                            a[i] = b[i];
                        }
                    } else {
                        delete a[i];
                    }
                } else {
                    delete a[i];
                }
            });
        }
    }
    return a;
}

//数组去重，返回新数组，新数组中没有重复值。

function uniqueArray(a) {
    var o = {},
        result = [];
    if (isArray(a)) {
        each(a, function (x) {
            var key = typeof x + x;
            if (o[key] !== 1) {
                o[key] = 1;
                result.push(x);
            }
        }, null, true);
    }
    return result;
}

// throttle form underscore.js

function throttle(fn, wait, options) {
    var context, args, result,
        timeout = null,
        previous = 0;

    function later() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = fn.apply(context, args);
    }

    options = options || {};
    return function () {
        var remaining,
            now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = fn.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}

function formatMsg(tplStr, contentObj) {
    tplStr = toStr(tplStr);
    each(contentObj, function (value, key) {
        tplStr = tplStr.replace(new RegExp('%' + key, 'gi'), toStr(value));
    });
    return tplStr;
}

function bufferStr(value) {
    return Buffer.isBuffer(value) ? value : toStr(value);
}

function base64(str) {
    var buf = Buffer.isBuffer(str) ? str : new Buffer(toStr(str));
    return buf.toString('base64');
}
//返回 str 的MD5值

function MD5(str, encoding) {
    return crypto.createHash('md5').update(bufferStr(str)).digest(encoding || 'hex');
}

function HmacMD5(str, pwd, encoding) {
    return crypto.createHmac('md5', bufferStr(pwd)).update(bufferStr(str)).digest(encoding || 'hex');
}

//返回 str 的SHA256值

function SHA256(str, encoding) {
    return crypto.createHash('sha256').update(bufferStr(str)).digest(encoding || 'hex');
}

//返回 str 的加密SHA256值，加密密码为 pwd

function HmacSHA256(str, pwd, encoding) {
    return crypto.createHmac('sha256', bufferStr(pwd)).update(bufferStr(str)).digest(encoding || 'hex');
}

//根据email返回gravatar.com的头像链接，returnUrl+'?s=200'则可获取size为200×200的头像

function gravatar(email) {
    return checkEmail(email) && 'http://www.gravatar.com/avatar/$hex'.replace('$hex', MD5(email.toLowerCase()));
}

//检测 str 是否为合法的email格式，返回 true/false

function checkEmail(str) {
    var reg = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
    return reg.test(str) && str.length >= 6 && str.length <= 64;
}

//检测 str 是否为合法的Url格式，返回 true/false

function checkUrl(str) {
    var reg = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;
    return reg.test(str) && str.length <= 2083;
}

/**
 * @description 检查用户ID
 * @param str
 * @returns {boolean}
 */
function checkUserID(str) {
    var reg = /^U[a-z]{5,}$/;
    return reg.test(str);
}
/**
 * @description 检查用户名
 * @param str
 * @param minLen
 * @param maxLen
 * @returns {boolean}
 */
function checkUserName(str, minLen, maxLen) {
    // console.log(str, minLen, maxLen);
    var reg = /^[(\u4e00-\u9fa5)a-z][(\u4e00-\u9fa5)a-zA-Z0-9_]{1,15}$/;
    var len = Buffer.byteLength(toStr(str), 'utf8');
    minLen = minLen || YDD.conf.sysConf.UserNameMinLen || 6;
    maxLen = maxLen || YDD.conf.sysConf.UserNameMaxLen || 30;
    // console.log(str, minLen, maxLen);
    return reg.test(str) && len >= minLen && len <= maxLen;
}

function checkID(str, idPre) {
    // var reg = new RegExp('^' + idPre + '[0-9A-Za-z]{3,}$');
    // return reg.test(str);
    if (str != '') {
        return str.length === 24;
    } else {
        return false;
    }
}

function cutStr(str, maxLen, minLen) {
    str = toStr(str);
    maxLen = maxLen > 0 ? maxLen : 0;
    minLen = minLen > 0 ? minLen : 0;
    var length = Buffer.byteLength(str, 'utf8');
    if (length < minLen) {
        str = '';
    } else if (length > maxLen) {
        var buf = new Buffer(maxLen + 3);
        buf.write(str, 0, 'utf8');
        str = buf.toString('utf8');
        str = str.slice(0, -2) + '…';
    }
    return str;
}

function filterTag(str) {
    str = trim(str, true);
    str = str.replace(/[,，、]/g, '');
    return cutStr(str, 25, 3);
}

function filterTitle(str) {
    var options = {
        whiteList: {},
        onIgnoreTag: function (tag, html) {
            return '';
        }
    };
    str = trim(str, true);
    str = YDD.module.xss(str, options);
    return cutStr(str, YDD.conf.sysConf.TitleMaxLen, YDD.conf.sysConf.TitleMinLen);
}

function filterSummary(str) {
    var options = {
        whiteList: {
            strong: [],
            b: [],
            i: [],
            em: []
        },
        onIgnoreTag: function (tag, html) {
            return '';
        }
    };
    str = YDD.module.xss(toStr(str), options);
    return cutStr(str, YDD.conf.sysConf.SummaryMaxLen);
}

function filterContent(str) {
    return cutStr(str, YDD.conf.sysConf.ContentMaxLen, YDD.conf.sysConf.ContentMinLen);
}
/**
 * @description  获取分页数据
 * @param {Object} req - 请求对象
 * @param {Array} list - 需要返回的列表
 * @param {Object} cache - 获取数据的缓存对象
 * @param {Function} callback - 回掉函数
 * @param {Function} errorHandler - 错误处理
 * @return 通过callback函数返回获取到的列表信息及分页信息
 */
function paginationList(req, list, cache, callback, errorHandler) {
    var param = req.query,
        p = +param.p || +param.pageIndex || 1,
        s = +param.s || +param.pageSize || 10,
        pagination = {},
        data = [];
    callback = callback || callbackFn;
    list = list || [];

    p = p >= 1 ? Math.floor(p) : 1;
    s = s >= 10 && s <= 500 ? Math.floor(s) : 10;
    pagination.total = list.length;
    list = list.slice((p - 1) * s, p * s);
    pagination.pageSize = s;
    pagination.pageIndex = p;
    then.each(list, function (cont, id) {
        cache.getP(id).fin(function (cont2, err, doc) {
            if (err && typeof errorHandler === 'function') {
                errorHandler(err, id);
            }
            cont(null, doc || null);
        });
    }).fin(function (cont, err, data) {
        removeItem(data, null);
        callback(null, data, pagination);
    });
}

function checkTimeInterval(req, type, set) {
    return then(function (cont) {
        // YDD.Cache.timeInterval[set ? 'put' : 'get'](req.session._id + type, set ? 1 : cont, cont);
        YDD.Cache.timeInterval[set ? 'put' : 'get'](req.session.id + type, set ? 1 : cont, cont);
    });
}

module.exports = {
    MD5: MD5,
    Err: Err,
    noop: noop,
    each: each,
    eachProto: eachProto,
    trim: trim,
    union: union,
    toStr: toStr,
    toNum: toNum,
    base64: base64,
    SHA256: SHA256,
    extend: extend,
    isEmpty: isEmpty,
    HmacMD5: HmacMD5,
    resJson: resJson,
    toArray: toArray,
    checkID: checkID,
    throttle: throttle,
    gravatar: gravatar,
    checkUrl: checkUrl,
    checkType: checkType,
    parseJSON: parseJSON,
    formatMsg: formatMsg,
    intersect: intersect,
    filterTag: filterTag,
    checkEmail: checkEmail,
    HmacSHA256: HmacSHA256,
    callbackFn: callbackFn,
    removeItem: removeItem,
    filterTitle: filterTitle,
    uniqueArray: uniqueArray,
    checkUserID: checkUserID,
    wrapCallback: wrapCallback,
    errorHandler: errorHandler,
    filterSummary: filterSummary,
    filterContent: filterContent,
    checkUserName: checkUserName,
    paginationList: paginationList,
    checkTimeInterval: checkTimeInterval,
    objectIdReverByTime: objectIdReverByTime
};
