/**
 * Created by linyong on 2015/7/7.
 */
'use strict';

describe("A suite of basic functions", function() {
    it("reverse word",function(){
       var email =  require('../../lib/email.js');
        expect("DCBA").toEqual(email.date());
    });
});