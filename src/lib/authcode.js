/**
 * Created by LinYong on 2015/7/24.
 * 11366846@qq.com
 */
//unserialize example
var unser = require('./unserialize.js')
var str = 'i:0;';
console.log(unser(str));

//---------------------------------------------------
var crypto = require('crypto');//需要NPM
var sprintf = require("sprintf-js").sprintf;//需要npm
var key = 'Ax9gfW3_DFGG';
function authcode(string, operation, key, expiry) {
    var ckey_length = 4;
    var expiry = 0;
    var key = md5(key);
    var keya = md5(key.substr(0, 16));
    var keyb = md5(key.substr(16, 16));
    var mtime = microtime().toString();
    mtime = md5(mtime);
    if (operation == 'DECODE') {
        //substr($string, 0, $ckey_length)
        var keyc = string.substr(0, ckey_length);
    } else {
        var keyc = mtime.substr(-4);
    }
    console.log('key:' + key);
    console.log('keya：' + keya);
    console.log('keyb：' + keyb);
    console.log('keyc：' + keyc);
    var cryptkey = keya + md5(keya + keyc);
    var key_length = cryptkey.length;
    //sprintf('%010d', $expiry ? $expiry + time() : 0).substr(md5($string.$keyb), 0, 16).$string;
    if (operation == 'DECODE') {
        var string1 = base64_decode(string.substr(ckey_length));
    } else {

        var string1 = sprintf("%010d", 0);
    }
    var string2 = md5(string + keyb).substr(0, 16);
    var string = string1 + string2 + string;
    string_length = string.length;
    var result = '';
    var box = new Array();
    var rndkey = new Array();
    for (var i = 0; i <= 255; i++) {
        box.push(i);
        rndkey[i] = ord(cryptkey[i % key_length]);
    }
    for (var j = i = 0; i < 256; i++) {
        j = (j + box[i] + rndkey[i]) % 256;
        var tmp = box[i];
        box[i] = box[j];
        box[j] = tmp;
    }
    for (var a = j = i = 0; i < string_length; i++) {
        a = (a + 1) % 256;
        j = (j + box[a]) % 256;
        var tmp = box[a];
        box[a] = box[j];
        box[j] = tmp;
        result += chr(ord(string[i]) ^ (box[(box[a] + box[j]) % 256]));
    }
    if (operation == 'DECODE') {
        var ctime = Math.floor(new Date().getTime() / 1000);
        //substr(md5(substr($result, 26).$keyb), 0, 16)
        _tmps = md5((result.substr(26)) + keyb).substr(0, 16);
        console.log(_tmps);
        if ((result.substr(0, 10) == 0 || result.substr(0, 10) - ctime > 0) && result.substr(10, 16) == _tmps) {
            return result.substr(26);
        } else {
            return '';
        }
    } else {
        var b64 = base64_encode(result);
        var _b64 = str_replace('=', '', b64);
        return keyc + _b64;
    }
}

/*var rs = authcode('abcsafdsfa', 'ENCODE', key);
console.log('encodeRS:' + rs);

var des=authcode('3751azAxCR7wpJmBsthVtXe7pxNmF0/MZKgKPSiFiHxH0rw', 'DECODE', key);
console.log('decodeRS:' + des);*/

function str_replace(search, replace, subject, count) {
    j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);
    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp)
                .split(f[j])
                .join(repl);
            if (count && s[i] !== temp) {
                this.window[count] += (temp.length - s[i].length) / f[j].length;
            }
        }
    }
    return sa ? s : s[0];
}

function base64_decode(data) {

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data += '';

    do {
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec.replace(/\0+$/, '');
}

function base64_encode(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
function chr(codePt) {

    if (codePt > 0xFFFF) {
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    return String.fromCharCode(codePt);
}
function ord(string) {
    var str = string + '',
        code = str.charCodeAt(0);
    if (0xD800 <= code && code <= 0xDBFF) {
        var hi = code;
        if (str.length === 1) {
            return code;
        }
        var low = str.charCodeAt(1);
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) {
        return code;
    }
    return code;
}

function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
function microtime() {
    var time = new Date().getTime();
    var sec = String(time / 1000);
    var seconds = String(sec.split('.')[0]);
    var micsec = String(sec.split('.')[1] / 1000000) + '00 ';
    var restr = micsec + seconds;
    console.log(restr);
   // restr = '0.75483100 1437708572'
    return restr;
}

module.exports ={
    authcode:authcode,
    microtime:microtime
}
