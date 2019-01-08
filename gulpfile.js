const gulp = require('gulp');
const { src, dest, series, parallel } = require('gulp');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const babel = require('gulp-babel');
const minify = require("gulp-babel-minify");
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

// Configuration

const basePath = {base: 'dev/'};
const distPath = './dist/';
const SOURCE_LIST = [`${basePath.base}service-worker.js`, `${basePath.base}index.html`, `${basePath.base}fonts/*`, `${basePath.base}lib/vue.min.js`];

/*
| ===========================================================================
| TASKS
| ===========================================================================
*/

/* ========== COPY SOURCES ========== */

function copySources(cb) {
  src(SOURCE_LIST, basePath)
  .pipe(dest(distPath))
  cb();
}

/* ========== STYLES ========== */

function styles(cb) {
  src(`${basePath.base}/css/*.css`, basePath)
  .pipe(autoprefixer({browsers: ['last 2 versions']}))
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(dest(distPath));
  cb();
}

/* ========== SCRIPTS ========== */

function scripts(cb) {
  src(`${basePath.base}/js/*.js`, basePath)
  .pipe(babel({
      presets: ['@babel/env']
  }))
  .pipe(minify())
  .pipe(gulp.dest(distPath));
  cb();
}

/* ========== IMAGES ========== */

function images(cb) {
  src(`${basePath.base}/img/*`, basePath)
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true, quality: 70}),
    imageminPngquant()
  ]))
  .pipe(gulp.dest(distPath))
  cb();
}

exports.dist = gulp.parallel(copySources, styles, scripts, images);