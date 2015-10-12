'use strict';
/*global require, module*/

module.exports = {
    MAIN: {
        err: '错误提示',
        dbErr: '数据库错误',
        loginErr: '登陆错误',
        registerClose: '暂时关闭注册，请稍后再来！',
        globalDomainErr: '域名错误',
        globalUrlErr: '网站网址错误',
        globalEmailErr: '管理员Email错误',
        requestDataErr: '请求数据错误',
        requestOutdate: '请求数据已过期',
        requestSent: '请求成功，验证链接已发送到您的邮箱，有效期24小时，请及时验证！',
        resetInvalid: '请求无效',
        resetOutdate: '请求已过期',
        serErr: "Web服务异常",
        timeIntervalErr: '操作太快啦，休息几秒再来'
    },
    SERVER: {
        errServer:"WEB服务发生异常",
        errClient:"发生客户端引起的严重错误",
        errTimeOut:"请求超时",
        err:"服务已经成功启动。端口： ",
        errXhr:"客户端不是xhr请求",
        errDir: "并不是一个有效的目录或文件！",
        errRun: "并不是一个有效的目录或run.js不存在！",
        errDB:"子系统数据库"
    },
    LOGIN: {
        hasNoAuth: '尚未分配任何系统权限！',
        userMis: '用户名或密码错误！',
        notAdded: '用户尚未授权登陆！'
    },
    USER: {
        UidNone: '用户Uid不存在',
        userNone: '用户不存在',
        userNameNone: '用户名不存在',
        userNameErr: '用户名格式错误',
        userNameExist: '用户名已存在',
        userEmailNone: 'Email不存在',
        userEmailErr: 'Email格式错误',
        userEmailExist: 'Email已存在',
        userEmailNotMatch: 'Email与用户名不匹配',
        userPasswd: '密码错误',
        userNeedLogin: '需要登录才能操作',
        userLocked: '用户已被锁定',
        userRoleErr: '权限不够'
    },
    MESSAGE: {
        at: '(%userName)[%userUrl] 在 (%articleTitle)[%articleUrl] 中提到了你'
    }
};