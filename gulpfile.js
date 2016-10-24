var shell = require('gulp-shell');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var cover = require('gulp-coverage');
var jshint = require('gulp-jshint');
var gulp = require('gulp');

var srcRoot = './lib/';
var tstRoot = './test/';

gulp.task('lint', function() {
  return gulp.src([
      srcRoot + '*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
  //.pipe(jshint.reporter('fail')); //there is an issue with this reporter: skipping
});

gulp.task('test', function() {
  return gulp.src(tstRoot + '*.js', {
      read: false
    })
    .pipe(mocha());
});

gulp.task('coverage', function() {
  return gulp.src(tstRoot + '*.js', {
      read: false
    })
    .pipe(cover.instrument({
      pattern: [srcRoot + '*.js'],
      debugDirectory: 'debug'
    }))
    .pipe(mocha())
    .pipe(cover.gather())
    .pipe(cover.format())
    .pipe(gulp.dest('reports'));
});

gulp.task('upload',
  shell.task(['gapps upload'], {
    cwd: '.'
  }));

gulp.task('default', ['lint', 'test', 'upload']);

gulp.task('watch', function() {
  gulp.watch([srcRoot + '*.js', tstRoot + '*.js'], ['lint', 'test']);
});
