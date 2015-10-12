'use strict';
var LogConf = {
    "appenders": [{
        "type": "console"
    },
        {
            "type": "file",
            "filename": "web.log",
            "maxLogSize": 10240000,
            "backups": 3,
            "category": "web" //此处不能修改
        }
    ],
    "replaceConsole": true
}

module.exports = LogConf;
