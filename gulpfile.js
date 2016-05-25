var gulp = require('gulp');
var concat = require('gulp-concat');
var shell = require('gulp-shell');

var srcRoot = './src/';
var cfgRoot = './cfg/';
var buildDir = './build/';

gulp.task('prepare-upload', function() {
  gulp.src([srcRoot + '*.js', cfgRoot + '*.js'])
      .pipe(gulp.dest(buildDir));
});

gulp.task('upload', shell.task(['gapps upload'], {cwd: '.', verbose: true}));

gulp.task('shorthand', shell.task([
  'gapps upload'
]));

gulp.task('default', ['prepare-upload', 'upload']);
