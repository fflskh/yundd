/**
 * Created by Administrator on 2015/9/8 0008.
 */

function f1(){
    var n = 1;
    var set = function(){
        n += 1;
    };
    var get = function(){
        console.log(n);
    }
    return {set:set, get:get};
}

var r = f1();
r.set();
r.get();    // 2
