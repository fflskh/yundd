/**
 * Created by 勇 on 2015/7/3.
 * 静态文件处理配置
 */

exports.StaticConf = {
    //静态文件配置
    //deflate和gzip配置
    isZlib: true, //是否开启delate和gizp压缩，大并发压缩虽然可以减少传输字节数，但是会影响性能
    staticMaxAge: 1000 * 60 * 60 * 24 * 7, //静态文件的缓存周期，建议设置为7天
    staticGetOnly: true, //静态是否只能通过get获取
    staticLv2MaxAge: 1000 * 60 * 60, //静态文件2级缓存更新周期，建议设置为1小时
    staticLv2Number: 100//静态文件2级缓存数量，可以根据内存的大小适当调整
};

exports.Expires = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60*60*24*365
};
exports.Compress = {
    match: /css|html/ig
};
exports.Welcome = {
    file: "index.html"
};
exports.Timeout = 20 * 60 * 1000;
exports.Secure = null;

exports.types = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "eot":"application/octet-stream",
    "otf":"application/octet-stream",
    "ttf":"application/octet-stream",
    "woff":"application/x-font-woff",
    "woff2":"application/x-font-woff2",
    "map":"text/plain",
    "xml": "text/xml"
};

exports.parseRange = function (str, size) {
    if (str.indexOf(",") != -1) {
        return;
    }

    var range = str.split("-"),
        start = parseInt(range[0], 10),
        end = parseInt(range[1], 10);

    // Case: -100
    if (isNaN(start)) {
        start = size - end;
        end = size - 1;
        // Case: 100-
    } else if (isNaN(end)) {
        end = size - 1;
    }

    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }

    return {start: start, end: end};
};