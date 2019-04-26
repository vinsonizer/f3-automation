/* jslint node: true */
'use strict'

var wp = {}

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services')
  var config = require('./config')
  module.exports = wp
}

const HEADERS = { 'content-type': 'application/json', 'key': config.wp.apikey }

wp.getServiceArgs = function () {
  var cfg = config.getConfiguration().wp
  return cfg
}

// always start with login and return the token
wp.login = function (callback) {
  var url = wp.getServiceArgs().baseurl + '/authentication/login'
  var args = {
    username: wp.getServiceArgs().username,
    password: wp.getServiceArgs().password,
    method: 'get'
  }
  doWpGet('', args, url, callback)
}

/* Retrieve all high level events in a given time period */
// TODO: need to do something with token headers!
wp.getEvents = function (token, callback) {
  var url = wp.getServiceArgs().baseurl + '/events'
  var args = { method: 'get' }
  doWpGet(token, args, url, callback)
}

wp.getEventDetail = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/events/' + event.id
  var args = { method: 'get' }
  doWpGet(token, args, url, callback)
}

wp.getEventElements = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/events/' + event.id + '/eventElements'
  var args = { method: 'get' }
  doWpGet(token, args, url, callback)
}

wp.getEventAssignments = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/eventAssignements/forEvent/' + event.id
  var args = { method: 'get' }
  doWpGet(token, args, url, callback)
}

/* ###################### START INTERNAL METHODS ####################### */

function doWpGet(token, args, url, callback) {
  services.webExec(
    wp.getServiceArgs(),
    url, args, function (err, result) {
      if (err) services.showSideBar(err)
      else callback(err, JSON.parse(result))
    })
}

function addToken (headerMap, token) {
  headerMap.authorization = token
  return headerMap
}

/* ######################  END INTERNAL METHODS  ####################### */
