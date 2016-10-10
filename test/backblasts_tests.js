var assert = require("chai").assert;
var sinon = require("sinon");
var bb = require("../src/backblasts.js").backblasts;

// Global Scope = :(
services = require("../src/services.js").services;

var WHEN = "<li><strong>When:</strong>01/01/2016</li>";
var QIC = "<li><strong>QIC:</strong>Zima, Bolt, Bing</li>";
var PAX = "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay, Bing</li>";

var UPDATE_DATE = new Date().toString();

describe('Backblasts Data', function() {
  var fetch_stub = sinon.stub(services, 'fetch');
  var parse_xml_stub = sinon.stub(services, 'parse_xml');

  var mockDoc = function() {
    var docMock = {
      getRootElement: function() {},
      getChild: function() {},
      getChildText: function() {},
      getChildren: function() {}
    };

    sinon.stub(docMock, 'getRootElement').returns(docMock);
    sinon.stub(docMock, 'getChild').withArgs('channel').returns(docMock);

    var getChildren = sinon.stub(docMock, 'getChildren');
    getChildren.withArgs('item').returns([docMock]);
    getChildren.withArgs('category').returns(['category1', 'category2']);

    var childText = sinon.stub(docMock, 'getChildText');
    childText.withArgs('link').returns("http://testurl.com");
    childText.withArgs('pubDate').returns(UPDATE_DATE);

    return docMock;
  };

  var cfg = {};

  describe('checkForUpdates', function() {
    it('should parse out workout dates', function() {

      fetch_stub.returns(WHEN + QIC + PAX);

      var docMock = mockDoc();
      parse_xml_stub.returns(docMock);

      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[0] === "01/01/2016", "Should parse out date");
        });
    });
    it('should parse out todays date if workout date not found', function() {

      fetch_stub.returns(QIC + PAX);

      var docMock = mockDoc();
      parse_xml_stub.returns(docMock);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          var dt = new Date();
          assert(rowValues[0] === (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getYear(), "Should set missing date to today");
        });

    });

    it('should parse out pax count and list', function() {
      fetch_stub.returns(PAX);

      var docMock = mockDoc();
      parse_xml_stub.returns(docMock);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 4, "Should parse out pax count");
        });
    });
    it('should parse out pax count', function() {
      var content = "The PAX:</strong> The Once-ler, Waterfoot, Vida, Chin Music, Crayola, Bullwinkle (FNG), Hannibal, Knight Rider, MAD, Pele, Adobe, Smash, Balk, Fireman Ed, Marge, Lambeau, Torpedo, Goonie (QIC) </li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 18, "Should parse out pax count");
        });
    });
    it('should parse out QIC', function() {
      var content = "<li><strong>QIC:</strong>Gears</li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 1, "Should parse out pax count");
        });
    });
    it('should handle QIC in pax list and QIC field', function() {
      var content = "<li><strong>QIC:</strong>Gears</li>" +
        "<li><strong>The PAX:</strong>Wingman,  Gears</li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 2, "Should parse out pax count and remove dupes from QIC");
        });

    });
    it('should handle multiple in QIC field with and', function() {
      var content = "<li><strong>QIC:</strong>Gears and Old Bay</li>" +
        "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay</li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 3, "Should handle multiple QIC and parse out 'and'");
        });
    });
    it('should handle multiple in QIC field with commas', function() {
      var content = "<li><strong>QIC:</strong>Zima, Bolt, Bing</li>" +
        "<li><strong>The PAX:</strong>Wingman,  Gears, Old Bay</li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 6, "Should handle multiple QIC and parse out 'commas'");
        });
    });
    it('should handle handle common acronyms', function() {
      var content = "<li><strong>QIC:</strong>Gears(YHC)</li>" +
        "<li><strong>The PAX:</strong>Wingman (Respect), Bolt(QIC), Sharkbait (2.0)</li>";
      fetch_stub.returns(content);
      var result = bb.checkForUpdates(
        cfg,
        function() {},
        function(newDate) {},
        function(rowValues) {
          assert(rowValues[2] === 4, "Should handle multiple QIC and parse out 'commas'");
        },
        function(rowValues) {
          var paxList = rowValues[2];
          assert(paxList.indexOf("bolt") != -1, "Should contain bolt");
          assert(paxList.indexOf("wingman") != -1, "Should contain wingman");
          assert(paxList.indexOf("gears") != -1, "Should contain gears");
          assert(paxList.indexOf("sharkbait") != -1, "Should contain sharkbait");
        });
    });
  });
});
