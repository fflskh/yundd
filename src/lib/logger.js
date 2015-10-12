'use strict';
/**
 * Created by LinYong on 2014/8/19.
 */
var log4js = require('log4js');
var logConf=require('../config/logger.js');
log4js.configure(logConf);

exports.logger=function(name){
    var logger = log4js.getLogger(name);
    logger.setLevel('DEBUG');
    return logger;
};
exports.log4js=log4js;