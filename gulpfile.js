const { watch, series, src, dest } = require('gulp')
const mocha = require('gulp-mocha')
const jshint = require('gulp-jshint')

function build (cb) {
  return src('./lib/*.js')
    .pipe(dest('./build/'))
}

function handleTestError (err) {
  console.log(err.toString())
  this.emit('end')
}

function test (cb) {
  return src('./test/*.js')
    .pipe(src('./lib/*.js'))
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', handleTestError)
}

function lint (cb) {
  return src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
}

exports.default = series(lint, build, test)
watch('./lib/*.js', exports.default)

/*
var shell = require('gulp-shell')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var gulp = require('gulp')

var srcRoot = './lib/'
var tstRoot = './test/'

gulp.task('lint', function () {
  return gulp.src([ srcRoot + '*.js' ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
  // .pipe(jshint.reporter('fail')); //there is an issue with this reporter: skipping
})

gulp.task('test', function () {
  return gulp.src(tstRoot + '*.js', { read: false })
    .pipe(mocha())
})

gulp.task('upload',
  shell.task(['gapps upload'], {
    cwd: '.'
  }))

gulp.task('default', ['lint', 'test', 'upload'])

gulp.task('watch', function () {
  gulp.watch([srcRoot + '*.js', tstRoot + '*.js'], ['lint', 'test'])
})
*/
