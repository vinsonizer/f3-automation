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

function dateHandler (dateStr) {
  var dp = dateStr.substring(9, dateStr.length - 1).split(',')
  return new Date(dp[0], dp[1], dp[2], dp[3], dp[4])
}

wp.getAssignments = function (callback) {
  wp.login(function (err, result) {
    if (err) callback(err)
    else {
      var token = result.token
      wp.getEvents(token, function (err, events) {
        if (err) callback(err)
        else {
          var promises = events.map(function (theEvent) {
            return new Promise(function (resolve, reject) {
              wp.getEventAssignments(token, theEvent, function (err, details) {
                if (err) reject(err)
                else {
                  resolve({
                    location: theEvent.location,
                    // there has to be a better way...
                    date: dateHandler(theEvent.worshipDate),
                    q: details.map(function (q) {
                      return q.assigneeName
                    })
                  })
                }
              })
            })
          })
          Promise.all(promises).then(function (results) {
            callback(err, results)
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
