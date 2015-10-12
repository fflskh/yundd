/**
 * Created by Administrator on 2015/7/12 0012.
 */
var http = require('http');
var fs = require('fs');
var appConfig = require('../config/appConf.js');
var path = require('path');

var config = [],
    processPath = path.dirname(process.argv[1]);

var readAuthKeySync = function(){
    var files = fs.readdirSync(processPath + '/apps/');
    console.log(files);
    for(var i=0; i<files.length; i++){
        var stats = fs.statSync(processPath + '/apps/' + files[i]);
        var path = processPath + '/apps/' + files[i] + "/run.js";
        console.log(path);
        if (stats.isDirectory() && fs.existsSync(path)) {
            //将读到的配置文件存储到config结构体中
            config.push(require(path));
        }
    }
    return config;
};

/**
 * 用户权限检查
 * @param req http请求
 * @param res http响应
 * @param next express next函数
 */
var authCheck = function(req, res, next){
    //若该用户的session.authkey不存在，则要向远端请求权限及authkey，并存储到session中
    console.log('__req.session : ',req.session);
    if(!req.session){
        return next('连接session服务器失败！');
    }
    if(!req.session.authkey){
        //将请求的hostname作为向远端请求的hostname（实际应该通过映射）
        var authUrl =  'http://' + req.hostname + ':' + appConfig.authSubSystemOpt.port+appConfig.authSubSystemOpt.path;
        console.log(authUrl);
        var request = http.request(authUrl, function(res) {
            var resData = '';
            var session = {};
            res.setEncoding('utf8');
            if(res.statusCode === 200){
                res.on('data', function(chunk){
                    resData += chunk;
                });
                res.on('end', function(){
                    session = JSON.parse(resData);
                    // 将用户信息追加存储在session中
                    for(var i in session){
                        if(session.hasOwnProperty(i)){
                            req.session[i] = session[i];
                        }
                    }
                    console.log('authcheck, req.session : ', req.session);
                    next();
                });
            } else{
                console.log('get auth from remote failed.');
                next();
            }
        }).on('error', function(e) {
            //当向远端服务器请求，如果出错时，给出提示（当前只打印）
            console.error(e);
            console.error('authrize failed!');
            next();
        });
        request.end();
    } else {
        next();
    }
};
//通过请求的localhost来确定authkey，并比较authkey与session中保存的authkey
//若相同，则该请求能访问指定的子系统，若不相同，则不能访问该子系统；
function authFilter(req, res, next){
    if(!req.session){
        return next('连接session服务器失败！');
    }
    if(!req.session.authkey)
        return next('没有权限访问该页面');

    if(config.length === 0){
        config = readAuthKeySync();
    }
    for(var i=0; i<config.length; i++){
        //比对相同host的authkey
        console.log(config[i].host);
        console.log(req.hostname);
        console.log(config[i].authkey);
        console.log( req.session.authkey);
        if(config[i].host === req.hostname && config[i].authkey === req.session.authkey) {
            console.log('通过校验');
            return next();
        }
    }
    next('没有权限访问该页面');
};

exports.authCheck = authCheck;
exports.authFilter = authFilter;