/**
 * Created by 勇 on 2015/7/2.
 */

module.exports={
    name:"演示程序",
    host:"127.0.0.1",//主机名，域名，不能留空，留空子系统将不会挂载
    port:18080,//监听端口，相同host下相同port最后加载的会覆盖之前加载的
    configDir:"",//默认为config
    modelDir:"",//默认为models
    apiDir:"",//默认为api
    assetsDir:"",//默认为assets
    index:"assets/index.html",//首页文件
    db:{
        host:"127.0.0.1",
        name:"test",
        user:"test",
        password:"test"
    },
    authkey : 'cptpl'
};


