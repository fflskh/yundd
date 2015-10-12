'use strict';
/*
 *  Created by LinYong on 2015/07/03.
 *
 */
var fs = require('fs'),
    path = require('path'),
  //  zlib = require('zlib'),
    url = require("url"),
    util = require('util'),
    http = require('http'),
    Q = require('q'),
  //  Qx = require("qx"),
    _ = require('lodash'),
    domain = require('domain'),
    express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    ueditor = require('ueditor'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
//    mongoStore = require('connect-mongo')(expressSession),
    RedisStore = require('connect-redis')(expressSession),
    serverDm = domain.create(),
    redis = require('redis'),
//    ejs = require('ejs'),
    processPath = __dirname;//||　path.dirname(process.argv[1]);
//   logger.info(processPath,__dirname);
var logger = require('./lib/logger').logger('web');

global.YDD = {}; // 注册变量YDD

serverDm.on('error', function (error) {
    delete error.domain;
    logger.error("WEB SERVER ERROR：", error);
});

serverDm.run(function () {
    YDD.APP = {};
    YDD.conf = {};
    YDD.conf.appConf = require('./config/appConf.js');
    YDD.conf.sysConf = {};
    YDD.processPath = processPath;
    YDD.app = express();
    YDD.mongoose = require('mongoose');


    YDD.module = {};
    YDD.module.nodeExcel = require('excel-export');
    YDD.module.Q = require('q');
    YDD.module.needle = require('needle');
    YDD.module._ = require('lodash');

    YDD.lib = {};
    YDD.lib.msg = require('./lib/msg.js');
    YDD.lib.tools = require('./lib/tools.js');
    YDD.lib.email = require('./lib/email.js');
    YDD.lib.converter = require('./lib/anyBaseConverter.js');
    YDD.lib.authcode = require('./lib/authcode.js').authcode;
    YDD.lib.unserialize = require('./lib/unserialize.js');

    YDD.robotReg = new RegExp('Baiduspider|Googlebot|BingBot|Slurp!', 'i');
    YDD.Cache = {};
    YDD.Err = YDD.lib.tools.Err;
    YDD.thenErrLog = function (cont, err) {
        logger.error(err);
    };
    YDD.app.resJson = YDD.lib.tools.resJson;


    var each = YDD.lib.tools.each,
        extend = YDD.lib.tools.extend,
        resJson = YDD.lib.tools.resJson;


    function exit() {
        YDD.db.Conection.close(function () {
        });
        return process.exit(1);
    }

    var ReadyApps = Q.nfcall(fs.readdir, processPath + '/apps/');

    /**
     * @description 通过读取apps目录下的所有子系统目录，挂载子系统
     * @param appDirName
     * @returns {*}
     * @constructor
     */
    function ReadApps(appDir) {
        //  logger.info('appDirName:' + appDirName);
        var deferred = Q.defer();
        fs.stat(appDir, function (error, stats) {
            if (error) {
                // deferred.reject(new Error(error));
                deferred.resolve(null);
                logger.error(appDir +  YDD.lib.msg.errDir);
            } else {
                var path = appDir + "/run.js";
                if (stats.isDirectory() && fs.existsSync(path)) {
                    var app = require(path);
                    if (app.host !== "" && !YDD.APP[app.host]) {
                        YDD.APP[app.host] = {};
                        YDD.APP[app.host][app.port] = app || {};
                        YDD.APP[app.host][app.port].dir = appDir;
                        YDD.APP[app.host][app.port].api = {};
                    } else if (YDD.APP[app.host]) {
                        YDD.APP[app.host][app.port] = app || {};
                        YDD.APP[app.host][app.port].dir = appDir;
                        YDD.APP[app.host][app.port].api = {};
                    }
                    deferred.resolve(YDD.APP[app.host][app.port]);
                } else {
                    deferred.resolve(null);
                    logger.error(appDir +  YDD.lib.msg.errRun);
                }
            }

        });
        return deferred.promise;
    }

    /**
     * @description 准备数据库连接
     * @param app
     * @returns {Promise.promise|*}
     * @constructor
     */
    function ReadyMongoDB(app) {
        var deferred = Q.defer();
        var mongoose = YDD.mongoose;// require('mongoose');    //引用mongoose模块
        var dbHost = app.db.host;
        var dbName = app.db.name;
        var userName = app.db.user;
        var password = app.db.password;
        var opts = {server: {auto_reconnect: true}, user: userName, pass: password}
        var db = mongoose.createConnection(dbHost, dbName, opts); //创建一个数据库连接
        db.on('error', function (err) {
            logger.error("子系统数据库:[" + dbHost + ',' + dbName + "] 连接错误！");
            //此处仅仅是告警，不阻止服务的正常运行
            //deferred.reject(new Error("数据库:["+dbHost+','+dbName+"] 连接错误！"));
            deferred.resolve("子系统数据库:[" + dbHost + ',' + dbName + "] 连接错误！");
        });
        db.on('connected', function () {
            //   logger.info("数据库:["+dbHost+','+dbName+"] 已经连接成功！");
        });
        db.on('disconnected', function () {
            logger.warn("子系统数据库:[" + dbHost + ',' + dbName + "] 已经断开连接！");
        });
        db.once('open', function () {
            //一次打开记录
            YDD.APP[app.host][app.port].DB = db;
            deferred.resolve("读取子系统" + app.name + "成功!");
            logger.info("子系统" + app.name + "的数据库:[" + dbHost + ',' + dbName + "]连接成功！");
        });
        return deferred.promise;
    }

    function ReadyRedis() {
        var deferred = Q.defer();
        var options = {
            "auth_pass": 'test'
        };

        var client = redis.createClient(options);
        client.on('ready', function () {
            logger.info("reids conect ok!");
            client.select(1, function (err, ok) {
                /* client.hset('auth.admin', "key","vae",function(err){
                 logger.info("reids insert ok!",err);
                 });
                 client.hset('auth.admin1', "abc",function(){
                 logger.info("reids insert ok!");
                 });
                 client.hset('auth.admin2', "abc",function(){
                 logger.info("reids insert ok!");
                 });
                 client.hget('auth.admin',"key", function(err,v){
                 logger.info("get hsh v!",err,v);
                 });*/
                YDD.redis = client;
                deferred.resolve(client);
            });

        });
        client.on('error', function (error) {
            deferred.reject(error);
        });
        return deferred.promise;

    }

    /**
     * @description 准备各子系统首页模板
     * @param app
     * @constructor
     */
    function ReadyIndexTpl(app) {
        var deferred = Q.defer();
        var indexPath = processPath + '/assets/index.html';
        if (typeof(app) === 'object') {
            indexPath = app.dir + '/' + app.index;
        }
        fs.readFile(indexPath, 'utf8', function (error, content) {
            if (error) {
                logger.error("读取" + indexPath + "模板发生错误：" + error);
                content = '<p>服务器上不存在需要访问的页面！</p>'
            }
            if (typeof(app) === 'object') {
                YDD.APP[app.host][app.port]['indexTpl'] = content;
            } else {
                YDD.Cache.indexTpl = content;
            }
            deferred.resolve(null);
        }); // 读取首页模板
        return deferred.promise;
    }

    /**
     * @description 准备experess
     * @param app -- 实例化的experess
     * @returns {!Promise}
     * @constructor
     */
    function ReadyExpress(app) {
        app.set('views', path.join(__dirname, 'assets'));
        // app.set('view engine', 'ejs');
        app.set('env', "development" || YDD.conf.appConf.env);
        //  app.engine('html', require('ejs').renderFile);

        app.use(cookieParser('ydd-session'));
        //生成session
        app.use(expressSession({
            store: new RedisStore({
                // redis-url: 'redis://localhost:6379/ydd',
                host: YDD.conf.appConf.RedisIp || "127.0.0.1",
                port: YDD.conf.appConf.RedisPort || 6379,
                prefix: "Ydd:",
                db: 0,
                pass: YDD.conf.appConf.RedisPass || "",
                ttl: YDD.conf.appConf.clearSessionTime || 1000 * 60 * 60 * 24 //24小时
            }),
            resave: false,
            saveUninitialized: true,
            secret: 'ydd-session'
        }));

        app.use(StaticHandle);
        //app.use(AuthHandle);


        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use("/ueditor/ue", ueditor(path.join(__dirname, '/assets/'), function (req, res, next) {
            UeditorRoute(req, res, next);
        }));
        app.use(methodOverride());

        app.use(function (req, res, next) {
            if (req.session) {
                req.session.port = req.app.get('port');
            }
            next();
        });
        //设置搜索引擎,路由等
        app.use(function (req, res, next) {
            AppRoute(req, res, next);
        });
        // app.use(express.static(processPath + '/app/dist')); 	// set the static files location /public/img will be /img for users
        app.use(multipart({
            uploadDir: processPath + '/upload'
        }));

        app.use(clientErrorHandler);
        app.use(errorHandler);
        return Q.fcall(function () {
            return app;
        });
    };
    /**
     * @description Ueditor编辑器处理
     * @param req
     * @param res
     * @param next
     * @constructor
     */
    function UeditorRoute(req, res, next) {
        // ueditor 客户发起上传图片请求
        logger.info("query action:", req.query, req.query.action);

        if (req.query.action === 'uploadimage') {
            var foo = req.ueditor;
            var date = new Date();
            var imgname = req.ueditor.filename;
            var img_url = '/ueditor/php/upload/image/';
            res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
            logger.info("uploadimage over!");
        }
        //  客户端发起图片列表请求
        else if (req.query.action === 'listimage') {
            var dir_url = '/ueditor/php/upload/image/';
            res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
        }
        //
        else if (req.query.action === 'uploadfile') {
            var file_url = '/ueditor/php/upload/file/';
            res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        }
        else if (req.query.action === 'listfile') {
            var dir_url = '/ueditor/php/upload/file/';
            res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
        }
        // 客户端发起其它请求
        else {
            logger.info('UEditor action:', req.query.action);
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/ueditor/php/config.json');
        }
    }

    /**
     * @description 路由处理：包括搜索引擎设置等
     * @param req
     * @param res
     * @param next
     * @constructor
     */
    function AppRoute(req, res, next) {
        var host = req.hostname;
        var port = req.app.get('port');
        if (YDD.APP[host][port]) {
            if (req.path) {
                var path = req.path.toLowerCase().replace(/^\//, "").split("/");
                //  logger.info(path);
                if (path[0] === 'api') {
                    if (true || !YDD.APP[host][port].api[path[1]]) {
                        var file = YDD.APP[host][port].dir + "/api/" + [path[1]] + ".js";
                        logger.info('__api file :', file);
                        fs.exists(file, function (exist) {
                            if (exist) {
                                YDD.APP[host][port].api[path[1]] = require(file);
                                //  logger.info(YDD.APP[host][port].api[path[1]][req.method]);
                                YDD.APP[host][port].api[path[1]][req.method](req, res, path, YDD.APP[host][port].DB, next);
                            } else {
                                next("请求的API:" + path[1] + "不存在！");
                            }
                        });
                    }
                    else {
                        YDD.APP[host][port].api[path[1]][req.method](req, res, path, YDD.APP[host][port].DB, next);
                    }
                }
                else if (YDD.robotReg.test(req.headers['user-agent'])) {
                    // 处理搜索引擎请求
                    YDD.api.get.article.robot(req, res); // 处理搜索引擎请求
                }


                else if (path[0] === 'sitemap.xml') {
                    YDD.api.get.article.sitemap(req, res); // 响应搜索引擎sitemap，动态生成
                }
                else if (path[0] === 'robots.txt') {
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(YDD.Cache.robotsTxt);
                }
                //转到首页
                else {
                    res.setHeader('Content-Type', 'text/html');
                    if (typeof(YDD.APP[host]) === 'object' && typeof(YDD.APP[host][port]) === 'object') {
                        res.send(YDD.APP[host][port].indexTpl);
                    } else {
                        res.send(YDD.Cache.indexTpl); // 响应首页index.html
                    }
                }
            } else {
                next('请求地址不存在！');
            }
        } else {
            next('子系统:' + host + '不存在！');
        }
    }


    /**
     * @description 所有环境设置 errHandler 定义如下，注意错误非常明确的向后传递了。
     * @param err
     * @param res
     * @param dm
     */

    function errHandler(err, res, dm) {
        delete err.domain;
        try {
            res.on('finish', function () {
                process.nextTick(function () {
                    dm.dispose();
                });
            });
            if (err.hasOwnProperty('name')) {
                res.send(resJson(err));
            } else {
                logger.error(err);
                res.send(resJson(YDD.Err(YDD.lib.msg.MAIN.reqDataErr)));
            }
        } catch (error) {
            delete error.domain;
            logger.error(error);
            dm.dispose();
        }
    }

    /**
     * @description 请求处理
     * @param req
     * @param res
     */
    function handler(req, res) {
        logger.info("获取到一个新的请求！ : ", req.headers.host + req.url);
        //var path = req.path.toLowerCase().replace(/^\//, "").split("/");
        var dm = domain.create();
        var host = req.headers.host.split(':')[0];
        var port = req.headers.host.split(':')[1] || 80;
        res.throwError = function (cont, error) { // 处理then.js捕捉的错误
            if (!util.isError(error)) {
                error = YDD.Err(error);
            }
            errHandler(error, res, dm);
        };
        dm.on('error', function (error) { // 处理domain捕捉的错误
            errHandler(error, res, dm);
        });
        dm.run(function () {
            var app = YDD.app;
            app.set('port', port);
            app(req, res); // 运行
        });
    }

    /**
     * @description 静态文件处理
     * @param req
     * @param res
     * @constructor
     */
    function StaticHandle(req, res, next) {
        var staticConf = require("./config/static.js")
        var mime = staticConf.types;
        var myExpires = staticConf.Expires;
        var zlib = require("zlib");


        var pathname = url.parse(req.url).pathname;


        var ext = path.extname(pathname);
        ext = ext ? ext.slice(1) : 'unknown';
        if (ext === 'unknown' || !mime[ext]) {
            next();
        } else {
            var host = req.headers.host.split(':')[0];
            var port = req.headers.host.split(':')[1] || 80;


            res.setHeader("Server", "YDD/V1.0");
            res.setHeader('Accept-Ranges', 'bytes');

            //   logger.info(pathname, host, port, req.session);

            if (pathname.slice(-1) === "/") {
                pathname = pathname + staticConf.Welcome.file;
            }
            var realPath = path.join("assets", path.normalize(pathname.replace(/\.\./g, "")));

            var pathHandle = function (realPath) {
                fs.stat(realPath, function (err, stats) {
                    if (err) {
                        logger.error(err);
                        res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
                        res.write("服务器上并不存在您所请求的URL " + pathname + " .");
                        res.end();
                    } else {
                        if (stats.isDirectory()) {
                            realPath = path.join(realPath, "/", 'index.html');
                            pathHandle(realPath);
                        }
                        else {
                            var ext = path.extname(realPath);
                            ext = ext ? ext.slice(1) : 'unknown';
                            var contentType = mime[ext] || "text/plain";
                            res.setHeader("Content-Type", contentType);
                            // res.setHeader('Content-Length', stats.size);

                            var lastModified = stats.mtime.toUTCString();
                            var ifModifiedSince = "If-Modified-Since".toLowerCase();
                            res.setHeader("Last-Modified", lastModified);

                            if (ext.match(myExpires.fileMatch)) {
                                var expires = new Date();
                                expires.setTime(expires.getTime() + myExpires.maxAge * 1000);
                                res.setHeader("Expires", expires.toUTCString());
                                res.setHeader("Cache-Control", "max-age=" + myExpires.maxAge);
                            }

                            if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
                                res.writeHead(304, "Not Modified");
                                res.end();
                            } else {
                                var compressHandle = function (raw, statusCode, reasonPhrase) {
                                    var stream = raw;
                                    var acceptEncoding = req.headers['accept-encoding'] || "";
                                    var matched = ext.match(staticConf.Compress.match);

                                    if (matched && acceptEncoding.match(/\bgzip\b/)) {
                                        //    logger.info("in compressHandle gzip");
                                        //  res.setHeader("Content-Encoding", "gzip");
                                        res.writeHead(200, {'content-encoding': 'gzip'});
                                        stream = raw.pipe(zlib.createGzip());
                                    } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                                        res.setHeader("Content-Encoding", "deflate");
                                        stream = raw.pipe(zlib.createDeflate());
                                    } else {
                                        res.writeHead(statusCode, reasonPhrase);
                                    }

                                    stream.on('error', function (err) {
                                        logger.error(err);
                                    });
                                    /*   stream.on('readable', function() {
                                     logger.info('there is some data to read now');
                                     });
                                     stream.on('data', function(chunk) {
                                     logger.info('got %d bytes of data', chunk.length);
                                     })
                                     stream.on('end', function() {
                                     logger.info('end pipe');
                                     //  logger.info("end compressHandle");
                                     //res.end();
                                     });
                                     stream.on('close', function() {
                                     logger.info('close pipe');
                                     });*/


                                    stream.pipe(res);

                                };

                                if (req.headers["range"]) {

                                    var range = staticConf.parseRange(req.headers["range"], stats.size);
                                    if (range) {
                                        res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
                                        res.setHeader("Content-Length", (range.end - range.start + 1));
                                        var raw = fs.createReadStream(realPath, {
                                            "start": range.start,
                                            "end": range.end
                                        });
                                        compressHandle(raw, 206, "Partial Content");
                                    } else {
                                        res.removeHeader("Content-Length");
                                        res.writeHead(416, "req Range Not Satisfiable");
                                        res.end();
                                    }
                                } else {

                                    var raw = fs.createReadStream(realPath);
                                    compressHandle(raw, 200, "Ok");
                                }
                            }
                        }
                    }
                });
            };

            fs.exists(realPath, function (exists) {
                if (!exists) {
                    if (YDD.APP[host] && YDD.APP[host][port]) {
                        realPath = path.join(YDD.APP[host][port].dir + "/" + (YDD.APP[host][port].assetsDir || 'assets'), path.normalize(pathname.replace(/\.\./g, "")));
                        logger.info("采用子系统静态路径：", realPath);
                    }
                } else {
                    logger.info("采用公用静态路径：", realPath);
                }
                pathHandle(realPath);
            });

        }

    }

    function AuthHandle(req, res, next) {
        var host = req.hostname;
        var port = req.app.get('port');
        var urls = 'http://' + host + ":" + port + "/";
        var regStr = YDD.conf.appConf.appLoginAddr;
        var reg = new RegExp(YDD.conf.appConf.appLoginAddr);
        var reg1 = /\/api\/login\/autologin\/\d+/;
        var reg2 = /\/api\/login\/logout\/\d+/;
        var reg3 = /\/api\/login\/login\/\d+/;
        var reg5 = /\/login\/dologin/;
        var reg4 = /\/authority/;
        logger.debug("sessionID:", req.sessionID);
        logger.debug("req.headers.userkey",req.headers);
        if(req.headers && req.headers.userkey == 'userkey'){
            logger.debug("req.headers.userkey",req.headers.userkey);
            next();
        }
        else if (reg.test(urls) && (reg1.test(req.path) || reg2.test(req.path) || reg3.test(req.path) || reg4.test(req.path) || reg5.test(req.path))) {
                next();
        }
        else if (reg.test(urls) && req.path == '/' && req.session.isadmin) {
            logger.debug('isadmin1 isadmin1',req.session);
            res.redirect('/admin');
        }
        else if(reg.test(urls) && req.path == '/' && req.session.user){
            logger.debug('no admin',req.session);
            res.redirect('/authority');
        }
        else if (req.sessionID !== '' && req.session) {
            res.set("Access-Control-Allow-Origin", "*");
            res.set("Access-Control-Allow-Headers", "X-Requested-With");
            res.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

            if (req.session.isadmin) {
                logger.debug('isadmin isadmin');
                next();
            }
            else if (req.session.user && typeof(req.session.user) == 'object'
                && req.session.user.authApps && YDD.APP[host][port] && YDD.APP[host][port].authkey !== '') {
                logger.debug("app key:" + YDD.APP[host][port].authkey);
                var apps = req.session.user.authApps;
                logger.debug("has apps:",apps);
                var appkey = YDD.APP[host][port].authkey || "";
                var haskey = _.result(_.find(apps, function (chr) {
                    return chr.appKey != "" && chr.appKey == appkey;
                }), 'appKey');
                logger.debug("haskey:" + haskey);
                if (haskey) {
                    next();
                } else {
                    logger.debug(req.method + " auth not enouth");
                    res.redirect(YDD.conf.appConf.appLoginAddr+"/login/dologin");
                }

            }
            else {
                logger.debug("session:", req.session);
                logger.debug("app key:" + YDD.APP[host][port].authkey);
                logger.debug(req.method + ":no auth");
                res.redirect(YDD.conf.appConf.appLoginAddr+"/login/dologin");
            }

        }
        else {
            logger.debug(req.method + ": no session.");
            res.redirect(YDD.conf.appConf.appLoginAddr+"/login/dologin");
        }
    }


    //通常logErrors用来纪录诸如stderr, loggly, 或者类似服务的错误信息：

    function logErrors(err, req, res, next) {
        next(err);
    }

//clientErrorHandler 定义如下，注意错误非常明确的向后传递了。

    function clientErrorHandler(err, req, res, next) {
        if (req.xhr || req.method == 'POST') {
            logger.error(err);
            res.send(500, {
                error: '服务器发生异常!'
            });
        } else {
            logger.error("客户端不是xhr请求", req.method);
            next(err);
        }
    }

//下面的errorHandler "捕获所有" 的异常， 定义为:

    function errorHandler(err, req, res, next) {
        logger.error('errorHandler:', err);
        var util = require('util');
        res.status(500);
        res.render('error.html', {
            error: util.inspect(err)
        });
    }

    /**
     * @description 开启HTTP SERVER
     * @param app
     * @returns {Promise.promise|*}
     * @constructor
     */
    function StartServers(app) {
        var deferred = Q.defer();
        var server = http.createServer();
        server.maxHeadersCount = 0;
        server.timeout = 120000;

        server.on('request', function (req, res) {
            handler(req, res);
        });
        server.on('timeout', function (res) {
            logger.error('请求超时: ', res.parser.incoming.url);
        });
        server.on('error', function (error) {
            logger.error('WEB服务发生严重错误: ', error);
        });
        server.on('clientError', function (exception, socket) {
            logger.error('发生客户端引起的严重错误: ', exception);
        });
        server.on('close', function () {
            logger.error('WEB服务关闭 ');
        });
        server.listen(app.port, function (err) {
            if (err) {
                logger.error(err);
                deferred.reject(err);
            } else {
                logger.info('服务已经成功启动。端口： ' + app.port);
                deferred.resolve("start server ");
            }

        });
        return deferred.promise;

    }

    ReadyApps
        .then(function (files) {
            var extApps = require('./config/apps.js').extApps;
            for (var i in files) {
                files[i] = processPath + '/apps/' + files[i];
            }
            var appPaths = _.union(files, extApps);
            return Q.all(appPaths.map(function (x, i) {
                return ReadApps(x);
            }));
        })
        .then(function (apps) {
            _.remove(apps, function (n) {
                return n == null;
            });
            return Q.all(apps.map(function (x, i) {
                return ReadyMongoDB(x);
            }));
        })
        .then(function () {
            var apps = [];
            for (var key in YDD.APP) {
                for (var k in YDD.APP[key]) {
                    apps.push(YDD.APP[key][k]);
                }
            }
            apps.push('serverTpl');
            return Q.all(apps.map(function (x, i) {
                return ReadyIndexTpl(x);
            }));

        })
        .then(function () {
            return Q.fcall(function () {
                return ReadyExpress(YDD.app);
            });
        })
        .then(function () {
            return ReadyRedis();
        })
        .then(function () {
            var apps = [];
            for (var key in YDD.APP) {
                for (var k in YDD.APP[key]) {
                    apps.push(YDD.APP[key][k]);
                }
            }

            return Q.all(apps.map(function (x, i) {
                return StartServers(x);
            }));
        })
        .fail(function (err) {
            logger.error(err);
        });
});
