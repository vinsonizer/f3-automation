var bb = require("../src/backblasts.js");
var assert = require("chai").assert;
var sinon = require("sinon");

describe('Backblasts Additional Data', function() {

  setup(function() {
    this.UrlFetchApp = {};
  });

  describe('getAdditionalData', function() {
    it('should return pax count', function() {
      getAdditionalData({});
    });
  });
});
