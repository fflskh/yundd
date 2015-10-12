/**
 * Created by linyong on 2015/7/6.
 */

var TestSchema=require('../models/test.js');
function test(req,res,path,db,next){
    var Test =   db.model('Test',TestSchema);
    Test.findByName('Hello kitty',function(err,dbs){
       console.log(dbs);
    });
    var testEntity = new Test({name:'kitty',age:3,child:[{name:'kim'}]});
    testEntity.meow();
    testEntity.add();

    testEntity.save(function(err,inst){
        if(err){
            console.log(err);
        }else{
            console.log('保存操作成功！');
            res.send({success:true,msg:"Hello Test!",inst:inst});
        }
    });
}

function save(req,res,path,db,next) {
    var obj = req.body;
    obj.age=10;
    var Test =   db.model('Test',TestSchema);
    var testEntity = new Test(obj);
    testEntity.save(function(err,inst){
        if(err){
            console.log(err);
        }else{
            console.log('保存操作成功！');
            res.send({success:true,msg:"Hello Test!",inst:inst});
        }
    });
}

function getone(req, res,path,db,next ){
    var Test =   db.model('Test',TestSchema);
    Test.findOne({},{},function(err,inst){
        res.send(inst);
    });
}

function index(req,res){
    res.send({success:true,msg:"Hello Index!"});
}

function update(req,res){
    res.ssend("1111");
}

module.exports = {
    GET: function (req, res,path,db,next) {
        console.log('get:',path[2]);
        switch (path[2]) {
            case undefined:
            case 'latest':
            case 'index':
                return index(req, res,path,db,next);
            case 'test':
                return test(req, res,path,db,next);
            case 'update':
                return update(req, res, 'updateList');
            case 'comment':
                return test(req, res, 'hotCommentsList');
            case 'getone':
                return getone(req, res,path,db,next );

            default:
                return test(req, res,path,db,next);
        }
    },
    POST: function (req, res,path,db,next) {
        console.log('post:',path[2]);
        switch (req.path[2]) {
            case undefined:
            case 'index':
                return test(req, res,path,db,next);
            case 'comment':
                return test(req, res,path,db,next);
            case 'save':
                return save(req, res,path,db,next);
            default:
                return test(req, res,path,db,next);
        }
    },
    DELETE: function (req, res) {
        return test(req, res);
    },
    convertArticles: "",
    sitemap: "",
    robot: ""
};