var bb = require("../src/backblasts.js");
var assert = require("chai").assert;

describe('Backblasts Additional Data', function() {
  describe('getAdditionalData', function() {
    it('should parse out workout dates', function() {
      stubBBText("<li><strong>When:</strong>01/01/2016</li>");
      var result = bb.getAdditionalData("http://someurl.com", []);
      assert(result.date == "01/01/2016", "Should parse out date");
    });
    it('should parse out pax count and list', function() {
      stubBBText("<li><strong>The PAX:</strong>Wingman</li>");
      var result = bb.getAdditionalData("http://someurl.com", []);
      assert(result.paxCount == 1, "Should parse out pax list");
      assert(result.paxList.indexOf("wingman") != -1, "Should parse out pax list");
    });
    it('should parse out QIC', function() {
      stubBBText("<li><strong>QIC:</strong>Gears</li>");
      var result = bb.getAdditionalData("http://someurl.com", []);
      assert(result.paxCount == 1, "Should parse out pax list");
      assert(result.paxList.indexOf("gears") != -1, "Should parse out pax list");
    });
    it('should handle QIC in pax list and QIC field', function() {
      stubBBText("<li><strong>QIC:</strong>Gears</li>" +
        "<li><strong>The PAX:</strong>Wingman,  Gears</li>");
      var result = bb.getAdditionalData("http://someurl.com", []);
      assert(result.paxCount == 2, "Should parse out pax list");
      assert(result.paxList.indexOf("gears") != -1, "Should capture QIC as a PAX");
      assert(result.paxList.indexOf("wingman") != -1, "Should capture non-QIC as a PAX");
    });
  });
});

// TODO: figure out how to do this with proper mocks instead of old school overrides
function stubBBText(text) {
  bb.UrlFetchApp.fetch = function() {
    return {
      getContentText: function() {
        return text;
      }
    };
  };
}
