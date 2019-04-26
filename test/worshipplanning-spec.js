/* global describe, beforeEach, afterEach, it */
var assert = require('chai').assert
var sinon = require('sinon')

var config = require('../lib/config')
var wp = require('../lib/worshipplanning')
var services = require('../lib/services')

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
    fetchStub.onFirstCall().returns(JSON.stringify({ token: testToken }))
    wp.login(function (err, result) {
      if (err) throw err
      else {
        assert.isOk(result.token, 'should have a token')
        assert.equal(result.token, testToken, 'token should match')
        done()
      }
    })
  })
})
