#### 开发环境安装

    npm install bower -g     //安装前端依赖工具

    npm install gulp-cli -g  //安装gulp工具

    npm install -g karma-cli

    npm install              // npm安装相关工具
    
    bower install            // 安装前端模块
    
    gulp  build              // build


#### 正式部署

1、运行环境配置
操作系统：Linux(CentOS,RedHad,Ubuntu) 64位
运行环境：需要nodejs 0.12+
数据库：redis 2.8+
        mongodb 2.6+
内存：4G+

2、需要部署的文件列表
cl2dserver.tar.gz
yddauth.tar.gz
yddcptpl.tar.gz
yddsbxxk.tar.gz

3、部署步骤
获取2中的文件放到/tmp
cd /tmp
mkdir -p /opt/cl2d

tar zxvf cl2dserver.tar.gz
mv cl2dserver /opt/cl2d

tar zxvf yddauth.tar.gz
mv yddauth /opt/cl2d/cl2dserver/apps/

tar zxvf   yddcptpl.tar.gz
mv yddcptpl /opt/cl2d/cl2dserver/apps/

tar zxvf yddsbxxk.tar.gz
mv yddsbxxk /opt/cl2d/cl2dserver/apps/

cd /opt/cl2d/cl2dserver/

4、安装依赖包
npm install -d
#安装pm2，管理应用
npm install pm2 -g

5、修改程序配置

cd /opt/cl2d/cl2dserver/
vi config/appConf.js
关注：1、redis相关配置
      2、权限系统登录页地址
vi config/logger.js ##推荐默认
vi config/static.js ##推荐默认


6、配置子系统
## 建议先阅读各子系统相关README.md文档，
## 如未特别说明按如下默认方式设置

cd /opt/cl2d/cl2dserver/apps/yddauth
#安装子系统依赖
npm install -d
#配置
vi run.js

cd /opt/cl2d/cl2dserver/apps/yddcptpl
#安装子系统依赖
npm install -d
#配置
vi run.js

cd /opt/cl2d/cl2dserver/apps/yddsbxxk
#安装子系统依赖
npm install -d
#配置
vi run.js

7、启动程序

pm2 start /opt/cl2d/cl2dserver/server.js
pm2 save #保存启动信息

pm2 list #查看当前服务情况
pm2 show server #查看当前服务情况