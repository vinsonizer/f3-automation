var assert = require("chai").assert;
var bb = require("../src/backblasts.js").BackblastChecker;


describe('Backblasts Additional Data', function() {
  describe('getAdditionalData', function() {
    it('should parse out workout dates', function() {
      var content = "<li><strong>When:</strong>01/01/2016</li>";
      var result = bb.getAdditionalData(content, []);
      assert(result.date == "01/01/2016", "Should parse out date");
    });
    it('should parse out pax count and list', function() {
      var content = "<li><strong>The PAX:</strong>Wingman</li>";
      var result = bb.getAdditionalData(content, []);
      assert(result.paxCount == 1, "Should parse out pax list");
      assert(result.paxList.indexOf("wingman") != -1, "Should parse out pax list");
    });
    it('should parse out QIC', function() {
      var content = "<li><strong>QIC:</strong>Gears</li>";
      var result = bb.getAdditionalData(content, []);
      assert(result.paxCount == 1, "Should parse out pax list");
      assert(result.paxList.indexOf("gears") != -1, "Should parse out pax list");
    });
    it('should handle QIC in pax list and QIC field', function() {
      var content = "<li><strong>QIC:</strong>Gears</li>" +
        "<li><strong>The PAX:</strong>Wingman,  Gears</li>";
      var result = bb.getAdditionalData(content, []);
      assert(result.paxCount == 2, "Should parse out pax list");
      assert(result.paxList.indexOf("gears") != -1, "Should capture QIC as a PAX");
      assert(result.paxList.indexOf("wingman") != -1, "Should capture non-QIC as a PAX");
    });
  });
});
