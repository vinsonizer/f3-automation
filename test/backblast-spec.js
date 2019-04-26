/* global describe, beforeEach, afterEach, it */
var assert = require('chai').assert
var sinon = require('sinon')

var bb = require('../lib/backblast')
var services = require('../lib/services')
var config = require('../lib/config')

var WHEN = '<li><strong>When:</strong><span class=\'workout_date\'>01/01/2016</span></li>'

var UPDATE_DATE = new Date().toString()

describe('Backblast Client', function () {
  var sandbox
  var parseXmlStub
  beforeEach(function () {
    sandbox = sinon.createSandbox()
    sandbox.stub(services, 'fetch')
    parseXmlStub = sandbox.stub(services, 'parseXml')
    sandbox.stub(config, 'getConfiguration').returns({
      backblast: {}
    })

    // base document mocking... PITA
    var docMock = {
      getRootElement: function () {},
      getChild: function () {},
      getChildText: function () {},
      getChildren: function () {},
      getText: function () {},
      getAttribute: function () {},
      getValue: function () {}
    }

    sinon.stub(docMock, 'getRootElement').returns(docMock)
    sinon.stub(docMock, 'getChild').withArgs('channel').returns(docMock)
    sinon.stub(docMock, 'getText').returns('hi')

    var getChildren = sinon.stub(docMock, 'getChildren')
    getChildren.withArgs('item').returns([docMock])
    getChildren.withArgs('category').returns([docMock])

    var childText = sinon.stub(docMock, 'getChildText')
    childText.withArgs('link').returns('http://testurl.com')
    childText.withArgs('pubDate').returns(UPDATE_DATE)

    var getAttribute = sinon.stub(docMock, 'getAttribute')
    getAttribute.withArgs('domain').returns(docMock)

    parseXmlStub.returns(docMock)
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should parse out workout dates', function (done) {
    services.fetch.returns(WHEN)
    bb.checkForUpdates(
      function (err, updates) {
        if (err) throw err
        else {
          assert.equal(updates[0].workoutDate.getMonth(), new Date().getMonth(), 'Should parse out month')
          assert.equal(updates[0].workoutDate.getDay(), new Date().getDay(), 'Should parse out day')
          assert.equal(updates[0].workoutDate.getYear(), new Date().getYear(), 'Should parse out year')
        }
        done()
      })
  })
  it('should parse out todays date if workout date not found', function (done) {
    services.fetch.returns('')
    bb.checkForUpdates(
      function (err, updates) {
        if (err) throw err
        else {
          assert.equal(updates[0].workoutDate.getMonth(), new Date().getMonth(), 'Should parse out month')
          assert.equal(updates[0].workoutDate.getDay(), new Date().getDay(), 'Should parse out day')
          assert.equal(updates[0].workoutDate.getYear(), new Date().getYear(), 'Should parse out year')
        }
        done()
      })
  })
})
