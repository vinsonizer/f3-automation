var config = {};

// Don't like fixed Sheet stuff here... 
config.getConfiguration = function () {
  var settingsSheet = getSpreadsheet().getSheetByName("Settings");
  var bbRange = settingsSheet.getRange("B2:B6");
  var twitterRange = settingsSheet.getRange("B8:B13");
  var trelloRange = settingsSheet.getRange("B15:B23");
  var properties = PropertiesService.getDocumentProperties();
  var _getValue = function (range, offset) {
    return range.getCell(1 + offset, 1).getValue();
  };
  var baseUrl = _getValue(bbRange, 0);
  var config = {
    backblast: {
      feedUrl: baseUrl + "feed/",
      pageUrl: baseUrl + "page/",
      bbCountSheetName: _getValue(bbRange, 1),
      attendanceSheetName: _getValue(bbRange, 2),
      updateFrequency: _getValue(bbRange, 3),
      lastUpdate: _getValue(bbRange, 4)
    },
    trello: {
      consumerKey: _getValue(trelloRange, 0),
      consumerSecret: _getValue(trelloRange, 1),
      boardName: _getValue(trelloRange, 2),
      inboxList: _getValue(trelloRange, 3),
      newContentList: _getValue(trelloRange, 4),
      oldContentList: _getValue(trelloRange, 5),
      retiredContentList: _getValue(trelloRange, 6),
      expiration: _getValue(trelloRange, 7),
      emailAddresses: _getValue(trelloRange, 8)
    },
    twitter: {
      tweetCountSheetName: _getValue(twitterRange, 0),
      consumerKey: _getValue(twitterRange, 1),
      consumerSecret: _getValue(twitterRange, 2),
      retweetMonitoringSearch: _getValue(twitterRange, 3),
      countsMonitoringSearch: _getValue(twitterRange, 4),
      updateFrequency: _getValue(twitterRange, 5)
    }
  };
  return config;
};

if (typeof module !== 'undefined') {
  module.exports = config;
}
