'use strict';

var gulp = require('gulp'),
    karma = require('karma').server,
    jasmine = require('gulp-jasmine'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    gulpSequence = require('gulp-sequence'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    rev = require('gulp-rev'),
    replace = require('gulp-replace'),
    usemin = require('gulp-usemin'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    ngmin = require('gulp-ngmin'),
    ngAnnotate = require('gulp-ng-annotate'),
    version = 'v' + require('./package.json').version,
    cdnHost = require('./package.json').cdnHost;

gulp.task('clean', function () {
    return gulp.src(['build/*'])
        .pipe(clean({force: true}));
});

gulp.task('jshint', function () {
    return gulp.src(['*.js', 'lib/*.js', 'config/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter());
});


gulp.task('html', function () {
    return gulp.src(['assets/servertpl/*.html','assets/servertpl/**/*.html'])
        .pipe(replace('VERSION', version))
        .pipe(minifyHtml({ empty: true, spare: true,quotes:true }))
        .pipe(gulp.dest('build/assets/servertpl/'));
});


gulp.task('image', function () {
    return gulp.src(['assets/images/**/*'])
        .pipe(gulp.dest('build/assets/images/'));
});


gulp.task('ico', function () {
    return gulp.src('assets/*.ico')
        .pipe(gulp.dest('build/assets/'));
});

gulp.task('txt', function () {
    return gulp.src('assets/*.txt')
        .pipe(gulp.dest('build/assets/'));
});

gulp.task('font', function () {

    return gulp.src('assets/bower_components/**/*.{ttf,woff,eof,svg}')
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest('build/assets/yddlib/'));

});

gulp.task('minMap', function () {

    return gulp.src('assets/bower_components/**/*.map')
        .pipe(rename({
            dirname: '/js'
        }))
        .pipe(gulp.dest('build/assets/yddlib/'));

});


gulp.task('ueditor', function () {
    return gulp.src(['assets/ueditor/**/*'])
        .pipe(gulp.dest('build/assets/ueditor/'));
});

gulp.task('assets', ['clean', 'html', 'image', 'ico', 'txt', 'font','ueditor','minMap']);

gulp.task('usemin', function () {
    return gulp.src('assets/index.html')
        .pipe(replace('.MIN',".min"))
        .pipe(usemin({
            yddcss: [minifyCss({keepSpecialComments: 0}), 'concat'],
            jshtml5: [ 'concat'],
            yddjslib: ['concat'],
            yddlib: [ngAnnotate(),ngmin({dynamic: false}),uglify({outSourceMap: false,compress:{
                global_defs:{
                    DEBUG:false
                }
            }}),'concat'],
            customjs: [ngAnnotate(),ngmin({dynamic: false}),uglify({outSourceMap: false,compress:{
                global_defs:{
                    DEBUG:false
                }
            }}), 'concat']
        })).pipe(gulp.dest('build/assets/yddlib/'));
});

gulp.task('useminIndex', function () {
    return gulp.src('build/assets/yddlib/index.html')
        .pipe(minifyHtml({ empty: true, spare: true,quotes:true }))
        .pipe(gulp.dest('build/assets/'));
});

gulp.task('demo',function(){
    return gulp.src(['apps/demo/**/*'])
        .pipe(gulp.dest('build/apps/demo'));
});

//压缩服务端代码
gulp.task('servermin', function () {
    return gulp.src(['server.js'])
        .pipe(uglify())
        .pipe(gulp.dest('build/'));
});

gulp.task('normalfiles', function () {
    return gulp.src(['*.{json,md}'])
        .pipe(gulp.dest('build/'));
});

gulp.task('configs', function () {
    return gulp.src(['config/*.js'])
        .pipe(gulp.dest('build/config/'));
});

gulp.task('libmin', function () {
    return gulp.src(['lib/**/*.js','lib/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('build/lib/'));
});




gulp.task('default', gulpSequence('jshint', 'clean', 'assets','demo'));
gulp.task('build', gulpSequence('default','servermin','libmin','configs','normalfiles', 'usemin','useminIndex'));


/**
 *
 *
 *
 * */



/**
 * Watch custom files
 */

gulp.task('watch', function () {
    gulp.watch([paths.images], ['custom-images']);
    gulp.watch([paths.styles], ['custom-less']);
    gulp.watch([paths.scripts], ['custom-js']);
    gulp.watch([paths.templates], ['custom-templates']);
    gulp.watch([paths.index], ['useminAdmin']);
});

/**
 * Live reload server
 */
gulp.task('webserver', function () {
    connect.server({
        root: 'app/dist/',
        livereload: true,
        port: 8888
    });
});

gulp.task('livereload', function () {
    gulp.src(['app/dist/**/*.*'])
        .pipe(watch())
        .pipe(connect.reload());
});




gulp.task('devserver', ['webserver', 'livereload', 'watch']);




/**
 * 对前端公共框架进行单元测试
 */
gulp.task('testweb', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

/**
 *
 *  对服务器端的脚本程序进行单元测试
 *
 */

gulp.task('testserver', function () {
    return gulp.src(['tests/*.js', 'tests/**/*.js'])
        .pipe(jasmine());
});

