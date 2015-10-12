/**
 * Created by linyong on 2015/7/6.
 */
var mongoose  = YDD.mongoose;
//var mongoose = require('mongoose');
var ChildSchema =  require('./child.js');

var TestSchema = new mongoose.Schema({
    name:String,   //定义一个属性name，类型为String
    age:Number,
    type:String,
    email:String,
    child:[ChildSchema]
});
//实例方法
TestSchema.method('meow', function () {
    console.log('meeeeeoooooooooooow');
});

TestSchema.method('add', function () {
    console.log('meeeeeoooooooooooow');
});
//静态方法
TestSchema.static('findByName', function (name, callback) {
    return this.find({ name: name }, callback);
});

//监听save完成事件，在save完成时执行
TestSchema.post('save', function (doc) {
    console.log('文档已经保存成功！');
});
//save事件触发之前时执行
TestSchema.pre('save', function (next) {
    if (!this.created) this.created = new Date;
    next();
});

TestSchema.pre('validate', function (next) {
    if (this.name != 'Woody') this.name = 'Woody';
    next();
});
module.exports=TestSchema;