'use strict';

var gulp = require('gulp'),
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
    version = 'v' + require('./package.json').version,
    cdnHost = require('./package.json').cdnHost;

gulp.task('clean', function () {
    return gulp.src(['app/dist/*', 'app/cdn/*'])
        .pipe(clean({force: true}));
});

gulp.task('jshint', function () {
    return gulp.src(['*.js', 'api/*.js', 'modules/*.js', 'patch/*.js', 'app/src/scripts/**/*.js', 'app/src/scripts/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter());
});

gulp.task('custom-ahead',['html','md','image','ico','txt']);
gulp.task('html', function () {
    return gulp.src('app/src/**/*.html')
        .pipe(replace('VERSION', version))
        .pipe(minifyHtml())
        .pipe(gulp.dest('app/dist/'));
});

gulp.task('md', function () {
    return gulp.src('app/src/md/*')
        .pipe(gulp.dest('app/dist/md/'));
});


gulp.task('image', function () {
    return gulp.src(['app/src/images/**/*','app/src/images/*'])
        .pipe(gulp.dest('app/dist/images/'));
});


gulp.task('ico', function () {
    return gulp.src('app/src/*.ico')
        .pipe(gulp.dest('app/dist/'));
});

gulp.task('txt', function () {
    return gulp.src('app/src/*.txt')
        .pipe(gulp.dest('app/dist/'));
});

gulp.task('font', function () {
    return gulp.src('app/bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest('app/dist/lib/fonts/'));
});

gulp.task('cdn', function () {
    return gulp.src(['app/dist/**/*', '!app/dist/js/*', '!app/dist/css/*'])
        .pipe(gulp.dest('app/cdn/'));
});

gulp.task('useminMin', function () {
    return gulp.src('app/src/index.html')
        .pipe(usemin({
        cssyf4h: [minifyCss({keepSpecialComments: 0}), 'concat'],
        jshtml5: [uglify(),'concat'],
        js: [uglify(), 'concat'],
        jsyf4h: [uglify(), 'concat']
        })).pipe(gulp.dest('app/dist/'));
});

gulp.task('usemin', function () {
  return gulp.src('app/src/index.html')
    .pipe(usemin({
      cssyf4h: [minifyCss({keepSpecialComments: 0}), 'concat'],
      jshtml5: [uglify(),'concat'],
      js: ['concat'],
      jsyf4h: [ 'concat']
    })).pipe(gulp.dest('app/dist/'));
});




gulp.task('default', gulpSequence('jshint', 'clean', 'custom-ahead'));
//gulp.task('default', gulpSequence('clean', ['html', 'md', 'image','ico','txt']));
gulp.task('buildCustom', gulpSequence('default', 'cdn', 'usemin'));


/**
 *
 *   后台管理端
 *
 * */
var paths = {
  scripts: 'app/src/scripts/**/*.*',
  styles: 'app/src/admin/less/**/*.*',
  images: 'app/src/admin/img/**/*.*',
  templates: 'app/src/admin/templates/**/*.html',
  index: 'app/src/admin.html',
  bower_fonts: 'app/bower_components/**/*.{ttf,woff,eof,svg}'
};

/**
 * Handle bower components from index
 */
gulp.task('useminAdmin', function() {
  return gulp.src(paths.index)
    .pipe(usemin({
      jshtml5: [uglify(), 'concat'],
      jsyfgl: [uglify(), 'concat'],
      css: [minifyCss({keepSpecialComments: 0}), 'concat']
    }))
    .pipe(gulp.dest('app/dist/'));
});

/**
 * Copy assets
 */
gulp.task('build-assets', ['copy-bower_fonts']);

gulp.task('copy-bower_fonts', function() {
  return gulp.src(paths.bower_fonts)
    .pipe(rename({
      dirname: '/fonts'
    }))
    .pipe(gulp.dest('app/dist/lib'));
});

/**
 * Handle custom files
 */
gulp.task('build-custom', ['custom-images', 'custom-js', 'custom-less', 'custom-templates','ueditor']);

gulp.task('custom-images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('app/dist/admin/img'));
});

gulp.task('custom-js', function() {
  return gulp.src(paths.scripts)
    .pipe(concat('dashboard.min.js'))
    .pipe(gulp.dest('app/dist/js'));
});

gulp.task('custom-js-min', function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('dashboard.min.js'))
    .pipe(gulp.dest('app/dist/js'));
});

gulp.task('custom-less', function() {
  return gulp.src(paths.styles)
    .pipe(less())
    .pipe(gulp.dest('app/dist/css'));
});

gulp.task('custom-templates', function() {
  return gulp.src(paths.templates)
    .pipe(minifyHtml())
    .pipe(gulp.dest('app/dist/admin/templates'));
});

gulp.task('ueditor', function () {
  return gulp.src(['app/src/ueditor/**/*','app/src/ueditor/**/**/*','app/src/ueditor/**/**/**/*'])
    .pipe(gulp.dest('app/dist/ueditor'));
});
/**
 * Watch custom files
 */
gulp.task('watch', function() {
  gulp.watch([paths.images], ['custom-images']);
  gulp.watch([paths.styles], ['custom-less']);
  gulp.watch([paths.scripts], ['custom-js']);
  gulp.watch([paths.templates], ['custom-templates']);
  gulp.watch([paths.index], ['useminAdmin']);
});

/**
 * Live reload server
 */
gulp.task('webserver', function() {
  connect.server({
    root: 'app/dist/',
    livereload: true,
    port: 8888
  });
});

gulp.task('livereload', function() {
  gulp.src(['app/dist/**/*.*'])
    .pipe(watch())
    .pipe(connect.reload());
});

/**
 * Gulp tasks
 */
gulp.task('buildAdmin', ['useminAdmin', 'build-assets', 'build-custom']);

gulp.task('devserver', [ 'webserver', 'livereload', 'watch']);

gulp.task('dev',gulpSequence('buildCustom','buildAdmin'));

gulp.task('build',gulpSequence('buildCustom','buildAdmin','custom-js-min'));
