/**
 * Created by ko on 2015/7/7.
 */
describe('fixture', function () {
    it('should pass', function () {
        expect(1 + 2).toEqual(3);
    });
});


describe('fixture1', function () {
    it('should pass 1', function () {
        var tool=require('../lib/tools.js');
        expect(false).toEqual(tool.isEmpty(''));
    });
});

describe('beforeAll', function () {
    var i = 0;

    beforeAll(function () {
        i++;
    });

    it('should be called first', function () {
        expect(i).toBe(1);
    });

    it('should be called once', function () {
        expect(i).toBe(1);
    });
});

xdescribe('the timeout', function () {
    it('should pass', function (done) {
        expect(1).toBe(1);

        setTimeout(function () {
            done();
        }, 6000);
    });
});