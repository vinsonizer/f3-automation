/* global describe, beforeEach, afterEach, it */
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')

const config = require('../lib/config')
const wp = require('../lib/worshipplanning')
const services = require('../lib/services')

var testEvents = JSON.parse(fs.readFileSync('test/data/worshipplanning.json', 'utf-8'))

describe('Worshipplanning Client', function () {
  var sandbox
  var fetchStub
  beforeEach(function () {
    sandbox = sinon.createSandbox()
    fetchStub = sandbox.stub(services, 'fetch')
    sandbox.stub(config, 'getConfiguration').returns({
      wp: {
        username: 'ABC',
        password: '123',
        apikey: 'supersecret',
        baseurl: 'http://testme.com'
      }
    })
    var fakeService = {
      hasAccess: function () {
        return true
      }
    }
    sandbox.stub(services, 'createOauthService').yields(null, fakeService)
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('Should be able to login', function (done) {
    var testToken = 'ABC123'
    fetchStub.onFirstCall().returns(JSON.stringify(testEvents.login))
    wp.login(function (err, token) {
      if (err) throw err
      else {
        assert.isOk(token, 'should have a token')
        assert.equal(token, testToken, 'token should match')
        done()
      }
    })
  })

  it('Should be able to fetch events', function (done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testEvents.getEvents))
    wp.getEvents('ABC123', function (err, result) {
      if (err) throw err
      else {
        assert.isOk(result, 'should have results')
        assert.equal(result.length, 10, 'should be 10 results')
        done()
      }
    })
  })

  it('Should be able to fetch event assignements', function (done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testEvents.getEventAssignments))
    wp.getEventAssignments('ABC123', { id: 12345 }, function (err, result) {
      if (err) throw err
      else {
        assert.isOk(result, 'should have results')
        assert.equal(result.length, 2, 'should be 2 results')
        done()
      }
    })
  })
})
