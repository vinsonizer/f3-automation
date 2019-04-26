/* jslint node: true */
'use strict'

var wp = {}

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services')
  var config = require('./config')
  module.exports = wp
}

function getBaseHeaders () {
  return { 'content-type': 'application/json', 'key': wp.getServiceArgs().apikey }
}

wp.getAssignments = function (callback) {
  wp.login(function (err, result) {
    if (err) callback(err)
    else {
      var token = result.token
      wp.getEvents(token, function (err, events) {
        if (err) callback(err)
        else {
          events.map(function (theEvent) {
            wp.getEventAssignments(token, theEvent, function (err, details) {
              if (err) callback(err)
              console.log(details)
            })
          })
        }
      })
    }
  })
}

wp.getServiceArgs = function () {
  var cfg = config.getConfiguration().wp
  return cfg
}

// always start with login and return the token
wp.login = function (callback) {
  var url = wp.getServiceArgs().baseurl + '/authentication/login'
  var args = {
    payload: {
      'username': wp.getServiceArgs().username,
      'password': wp.getServiceArgs().password
    },
    method: 'get'
  }
  doWpGet('', args, url, function (result) { return JSON.parse(result).token }, callback)
}

/* Retrieve all high level events in a given time period */
// TODO: need to do something with token headers!
wp.getEvents = function (token, callback) {
  var url = wp.getServiceArgs().baseurl + '/events'
  var args = { method: 'get', headers: addToken(getBaseHeaders(), token) }
  doWpGet(token, args, url, function (result) { return JSON.parse(result).data }, callback)
}

wp.getEventDetail = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/events/' + event.id
  var args = { method: 'get', headers: addToken(getBaseHeaders(), token) }
  doWpGet(token, args, url, function (result) { return JSON.parse(result) }, callback)
}

wp.getEventElements = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/events/' + event.id + '/eventElements'
  var args = { method: 'get', headers: addToken(getBaseHeaders(), token) }
  doWpGet(token, args, url, function (result) { return JSON.parse(result) }, callback)
}

wp.getEventAssignments = function (token, event, callback) {
  var url = wp.getServiceArgs().baseurl + '/eventAssignements/forEvent/' + event.id
  var args = { method: 'get', headers: addToken(getBaseHeaders(), token) }
  doWpGet(token, args, url, function (result) { return JSON.parse(result) }, callback)
}

/* ###################### START INTERNAL METHODS ####################### */

function doWpGet (token, args, url, extractor, callback) {
  services.webExec(
    wp.getServiceArgs(),
    url, args, function (err, result) {
      if (err) services.showSideBar(err)
      else callback(err, extractor(result))
    })
}

function addToken (headerMap, token) {
  headerMap.authorization = token
  return headerMap
}

/* ######################  END INTERNAL METHODS  ####################### */
