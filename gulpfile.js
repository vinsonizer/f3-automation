var shell = require('gulp-shell');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var cover = require('gulp-coverage');
var jshint = require('gulp-jshint');
var cleanDest = require('gulp-clean-dest');
var gulp = require('gulp');

var srcRoot = './src/';
var cfgRoot = './cfg/';
var tstRoot = './test/';
var buildDir = './build/';

gulp.task('lint', function() {
  return gulp.src([
      srcRoot + '*.js',
      cfgRoot + '*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
  //.pipe(jshint.reporter('fail')); //there is an issue with this reporter: skipping
});

gulp.task('build', function() {
  return gulp.src([
    srcRoot + '*.js',
    cfgRoot + '*.js'
  ])

  .pipe(gulp.dest(buildDir));
});


gulp.task('test', function() {
  return gulp.src(tstRoot + '*.js', {
      read: false
    })
    .pipe(mocha())
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

gulp.task('cleanup', function() {
  return cleanDest(buildDir);
});


gulp.task('default', ['cleanup', 'lint', 'build', 'test', 'upload']);

gulp.task('watch', function() {
  gulp.watch(['src/*.js', 'test/*.js'], ['cleanup', 'lint', 'build', 'test']);
});
