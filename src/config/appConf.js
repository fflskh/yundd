'use strict';
var path = require('path'),
    processPath = path.dirname(process.argv[1]);//运行node的目录，这里可以方便替换下面baseDir的__dirname,方便用户自己搭建目录
module.exports = {
//通用配置
    /*
     * 注意，所有的路径配置的前面请加‘/’而后面不要加'/'！
     */
    isDev: true,//开发模式下可以获取更多的信息，针对静态页面加载src目录
    server: '127.0.0.1',
    description: '云点点Cl2dServer',
    poweredBy: '云点点',
    listenPort: 18080,//DEMO监听端口
    baseDir: processPath,//这里是根据启动nodejs的命令目录来设置baseDir
    charset: 'utf-8',
    autoStatic: '/assets',  //自动响应静态文件的uri
    uploadFolder: '/tmp/upload', //文件上传的临时目录
    postLimit: 1024 * 1024 * 3,//限制上传的postbody大小，单位byte

    //session内存
    sessionName: 'Ydd', //保存session id 的cookie 的name
    sessionExpire: 1000 * 60 * 10, //false表示会话session，否则填入1000*60，表示session有效1分钟
    clearSessionSetInteval: 1000 * 60 * 60, //自动清理垃圾session时间，建设设置为1小时
    clearSessionTime: 1000 * 60 * 60 * 24,//会话session超时，建议设置为1天


   //Reids配置
    RedisIp: "127.0.0.1",//127.0.0.1
    RedisPort: 6379,//6379
    RedisPass: "test",//test

    //权限系统选择URL地址
    appLoginAddr: 'http://127.0.0.1:18084/'
};

