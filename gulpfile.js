var gulp = require('gulp');
var concat = require('gulp-concat');
var shell = require('gulp-shell');
var cleanDest = require('gulp-clean-dest');

var srcRoot = './src/';
var cfgRoot = './cfg/';
var buildDir = './build/';

gulp.task('prepare-upload', function() {
  gulp.src([srcRoot + '*.js', cfgRoot + '*.js'])
      .pipe(gulp.dest(buildDir));
});

gulp.task('upload',
  shell.task(['gapps upload'], {cwd: '.'}));

gulp.task('cleanup', function() {
  return cleanDest(buildDir);
});

gulp.task('default', ['cleanup', 'prepare-upload', 'upload']);
