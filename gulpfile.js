const { series, src, dest } = require('gulp')
const mocha = require('gulp-mocha')
const jshint = require('gulp-jshint')
const exec = require('child_process').exec

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
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', handleTestError)
}

function lint (cb) {
  return src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
}

function gappsUpload (cb) {
  exec('gapps upload', function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
}

// exports.watch = watch('./lib/*.js', series(lint, test, build))
exports.default = series(lint, test, build)
exports.upload = series(lint, test, build, gappsUpload)
