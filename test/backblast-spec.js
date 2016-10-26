var assert = require("chai").assert;
var sinon = require("sinon");

var bb = require("../lib/backblast");
var services = require("../lib/services");
var config = require("../lib/config");

var WHEN = "<li><strong>When:</strong>01/01/2016</li>";
var QIC = "<li><strong>QIC:</strong>Zima, Bolt, Bing</li>";
var PAX = "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay, Bing</li>";

var UPDATE_DATE = new Date().toString();

describe('Backblast Client', function() {
  var sandbox;
  var fetchStub;
  var parseXmlStub;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fetchStub = sandbox.stub(services, 'fetch');
    parseXmlStub = sandbox.stub(services, 'parseXml');
    sandbox.stub(config, 'getConfiguration').returns({
      backblast: {}
    });

    // base document mocking... PITA
    var docMock = {
      getRootElement: function() {},
      getChild: function() {},
      getChildText: function() {},
      getChildren: function() {},
      getText: function() {},
    };

    sinon.stub(docMock, 'getRootElement').returns(docMock);
    sinon.stub(docMock, 'getChild').withArgs('channel').returns(docMock);
    sinon.stub(docMock, 'getText').returns("hi");

    var getChildren = sinon.stub(docMock, 'getChildren');
    getChildren.withArgs('item').returns([docMock]);
    getChildren.withArgs('category').returns([docMock]);

    var childText = sinon.stub(docMock, 'getChildText');
    childText.withArgs('link').returns("http://testurl.com");
    childText.withArgs('pubDate').returns(UPDATE_DATE);

    parseXmlStub.returns(docMock);

  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should parse out workout dates', function(done) {

    services.fetch.returns(WHEN + QIC + PAX);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].workoutDate.getMonth(), new Date("01/01/2016").getMonth(), "Should parse out month");
        assert.equal(updates[0].workoutDate.getDay(), new Date("01/01/2016").getDay(), "Should parse out day");
        assert.equal(updates[0].workoutDate.getYear(), new Date("01/01/2016").getYear(), "Should parse out year");
        done();
      });
  });
  it('should parse out todays date if workout date not found', function(done) {

    services.fetch.returns(QIC + PAX);
    var result = bb.checkForUpdates(
      function(err, updates) {
        var dt = new Date();
        assert.equal(updates[0].workoutDate.getMonth(), new Date().getMonth(), "Should parse out month");
        assert.equal(updates[0].workoutDate.getDay(), new Date().getDay(), "Should parse out day");
        assert.equal(updates[0].workoutDate.getYear(), new Date().getYear(), "Should parse out year");
        done();
      });

  });

  it('should parse out pax count and list', function(done) {
    services.fetch.returns(PAX);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].paxList.length, 4, "Should parse out pax count");
        done();
      });
  });
  it('should parse out pax count', function(done) {
    var content = "The PAX:</strong> The Once-ler, Waterfoot, Vida, Chin Music, Crayola, Bullwinkle (FNG), Hannibal, Knight Rider, MAD, Pele, Adobe, Smash, Balk, Fireman Ed, Marge, Lambeau, Torpedo, Goonie (QIC) </li>";
    services.fetch.returns(content);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].paxList.length, 18, "Should parse out pax count");
        done();
      });
  });
  it('should handle QIC in pax list and QIC field', function(done) {
    var content = "<li><strong>QIC:</strong>Gears</li>" +
      "<li><strong>The PAX:</strong>Wingman,  Gears</li>";
    services.fetch.returns(content);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].paxList.length, 2, "Should parse out pax count and remove dupes from QIC");
        done();
      });

  });
  it('should handle multiple in QIC field with and', function(done) {
    var content = "<li><strong>QIC:</strong>Gears and Old Bay</li>" +
      "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay</li>";
    services.fetch.returns(content);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].paxList.length, 3, "Should handle multiple QIC and parse out 'and'");
        done();
      });
  });
  it('should handle multiple in QIC field with commas', function(done) {
    var content = "<li><strong>QIC:</strong>Zima, Bolt, Bing</li>" +
      "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay</li>";
    services.fetch.returns(content);
    var result = bb.checkForUpdates(
      function(err, updates) {
        assert.equal(updates[0].paxList.length, 6, "Should handle multiple QIC and parse out 'commas'");
        done();
      });
  });
  it('should handle handle common acronyms', function(done) {
    var content = "<li><strong>QIC:</strong>Gears(YHC)</li>" +
      "<li><strong>The PAX:</strong>Wingman (Respect), Bolt(QIC), Sharkbait (2.0)</li>";
    services.fetch.returns(content);
    var result = bb.checkForUpdates(
      function(err, updates) {
        var paxList = updates[0].paxList;
        assert(paxList.indexOf("bolt") != -1, "Should contain bolt");
        assert(paxList.indexOf("wingman") != -1, "Should contain wingman");
        assert(paxList.indexOf("gears") != -1, "Should contain gears");
        assert(paxList.indexOf("sharkbait") != -1, "Should contain sharkbait");
        done();
      });
  });
});
